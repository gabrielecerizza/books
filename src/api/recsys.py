import lightning as L
import numpy as np
import pandas as pd
import torch
from lightning.pytorch.trainer import seed_everything
from sklearn.cluster import KMeans
from sklearn.decomposition import TruncatedSVD, NMF
from sklearn.metrics import root_mean_squared_error
from sklearn.model_selection import train_test_split
from torch import nn
from torch.autograd import Variable
from torch.nn import functional
from torch.utils.data import DataLoader
from torch.utils.data.dataset import Dataset


import db


# seed_everything(42)


def show_clusters(model, n_clusters, dataset, item_id="Id", score="review/score"):
    trained_item_embeddings = model.item_factors.weight.data.cpu().numpy()
    kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(trained_item_embeddings)
    item_names = dataset.get_title_dict()

    for cluster in range(n_clusters):
        itemidx = np.where(kmeans.labels_ == cluster)[0]
        itemids = [dataset.idx2bookid[idx] for idx in itemidx]
        rat_count = dataset.ratings_df[dataset.ratings_df[item_id].isin(itemids)].groupby(item_id, as_index=False).count()[[item_id, score]].to_numpy()
        rat_count = [(item_names[tup[0]], tup[1]) for tup in rat_count]
        print("CLUSTER ", cluster)
        print(sorted(rat_count, key=lambda tup: tup[1], reverse=True)[:10])


class MovieLensDataset(Dataset):
    def __init__(self, base_path="E:/datasets/movielens/ml-latest-small/"):
        self.ratings_df = pd.read_csv(base_path + "ratings.csv")
        self.movies_df = pd.read_csv(base_path + "movies.csv")
        
        self.ratings = self.ratings_df.copy()
        
        users = self.ratings_df.userId.unique()
        movies = self.ratings_df.movieId.unique()
        
        self.userid2idx = {o:i for i,o in enumerate(users)}
        self.movieid2idx = {o:i for i,o in enumerate(movies)}
        
        self.idx2userid = {i:o for o,i in self.userid2idx.items()}
        self.idx2movieid = {i:o for o,i in self.movieid2idx.items()}
        
        self.ratings.movieId = self.ratings_df.movieId.apply(lambda x: self.movieid2idx[x])
        self.ratings.userId = self.ratings_df.userId.apply(lambda x: self.userid2idx[x])
        
        self.X = self.ratings.drop(["rating", "timestamp"], axis=1).values
        self.y = self.ratings["rating"].values
        self.X, self.y = torch.tensor(self.X), torch.tensor(self.y)

    def __getitem__(self, index):
        return self.X[index], self.y[index]

    def __len__(self):
        return len(self.ratings)

    def get_nums(self):
        n_users = len(self.ratings_df.userId.unique())
        n_items = len(self.ratings_df.movieId.unique())
        return n_users, n_items

    def get_title_dict(self):
        return self.movies_df.set_index("movieId")["title"].to_dict()


class BooksDataset(Dataset):
    def __init__(self, ids, base_path="E:/datasets/books/"):
        self.ratings = pd.read_csv(base_path + "books_rating.csv")
        self.books_df = pd.read_csv(base_path + "books_data.csv")
        self.books_df = self.books_df.merge(self.ratings, on="Title")
        
        self.ratings = self.ratings.dropna()
        self.ratings = self.ratings[self.ratings["Id"].isin(ids)][
            ["Id", "User_id", "review/score"]]
        self.ratings = self.ratings.drop_duplicates(subset=["User_id", "Id"])
        self.ratings_df = self.ratings.copy()

        users = self.ratings["User_id"].unique()
        books = self.ratings["Id"].unique()

        self.userid2idx = {o:i for i,o in enumerate(users)}
        self.bookid2idx = {o:i for i,o in enumerate(books)}

        self.idx2userid = {i:o for o,i in self.userid2idx.items()}
        self.idx2bookid = {i:o for o,i in self.bookid2idx.items()}

        self.ratings["Id"] = self.ratings["Id"].apply(lambda x: self.bookid2idx[x])
        self.ratings["User_id"] = self.ratings["User_id"].apply(
            lambda x: self.userid2idx[x])

        self.X = self.ratings.drop(["review/score"], axis=1)[["User_id", "Id"]].values
        self.y = self.ratings["review/score"].values
        
        self.X, self.y = torch.tensor(self.X), torch.tensor(self.y)

    def __getitem__(self, index):
        return self.X[index], self.y[index]

    def __len__(self):
        return len(self.ratings)

    def get_nums(self):
        n_users = len(self.ratings["User_id"].unique())
        n_items = len(self.ratings["Id"].unique())
        return n_users, n_items

    def get_title_dict(self):
        return self.books_df.set_index("Id")["Title"].to_dict()
    

class PivotBooksDataset(Dataset):
    def __init__(self, ids, base_path="E:/datasets/books/"):
        self.ratings = pd.read_csv(base_path + "books_rating.csv")
        self.books_df = pd.read_csv(base_path + "books_data.csv")
        self.books_df = self.books_df.merge(self.ratings, on="Title")
        
        self.ratings = self.ratings.dropna()
        self.ratings = self.ratings[self.ratings["Id"].isin(ids)][
            ["Id", "User_id", "review/score"]]
        self.ratings = self.ratings.drop_duplicates(subset=["User_id", "Id"])
        
        users = self.ratings["User_id"].unique()
        books = self.ratings["Id"].unique()

        self.userid2idx = {o:i for i,o in enumerate(users)}
        self.bookid2idx = {o:i for i,o in enumerate(books)}

        self.idx2userid = {i:o for o,i in self.userid2idx.items()}
        self.idx2bookid = {i:o for o,i in self.bookid2idx.items()}

        self.users_items_pivot_matrix_df = self.ratings.pivot(
            index="User_id", 
            columns="Id", 
            values="review/score").fillna(0)
        
        self.X = torch.Tensor(self.users_items_pivot_matrix_df.to_numpy())

    def __getitem__(self, index):
        return self.X[index], self.X[index]

    def __len__(self):
        return self.X.shape[0]

    def get_nums(self):
        n_users = len(self.ratings["User_id"].unique())
        n_items = len(self.ratings["Id"].unique())
        return n_users, n_items

    def get_title_dict(self):
        return self.books_df.set_index("Id")["Title"].to_dict()
    

class BooksDBDataset(Dataset):
    def __init__(self):
        reviews = db.get_all_reviews()
        self.reviews_df = pd.DataFrame(reviews)
        books = db.get_all_books()
        self.books_df = pd.DataFrame(books)
        reg_users = db.get_all_registered_users()
        self.reg_users = pd.DataFrame(reg_users)
        
        self.ratings = self.reviews_df.drop_duplicates(subset=["user_id", "book_id"]).copy()
        self.ratings_df = self.ratings.copy()

        self.users = self.ratings["user_id"].unique()
        self.books = self.ratings["book_id"].unique()

        c = 0
        for ru in self.reg_users["id"]:
            print(ru)
            if not ru in self.users:
                self.users = np.append(self.users, str(ru))
                c += 1

        self.userid2idx = {o:i for i,o in enumerate(self.users)}
        self.bookid2idx = {o:i for i,o in enumerate(self.books)}

        self.idx2userid = {i:o for o,i in self.userid2idx.items()}
        self.idx2bookid = {i:o for o,i in self.bookid2idx.items()}

        self.ratings["book_id"] = self.ratings["book_id"].apply(lambda x: self.bookid2idx[x])
        self.ratings["user_id"] = self.ratings["user_id"].apply(lambda x: self.userid2idx[x])

        self.X = self.ratings.drop(["username", "score", "time", "review_text"], axis=1)[["user_id", "book_id"]].values
        self.y = self.ratings["score"].values

        self.X, self.y = torch.tensor(self.X), torch.tensor(self.y)

    def __getitem__(self, index):
        return self.X[index], self.y[index]

    def __len__(self):
        return len(self.ratings)

    def get_nums(self):
        n_users = self.users.shape[0]
        n_items = len(self.ratings["book_id"].unique())
        return n_users, n_items

    def get_title_dict(self):
        return self.books_df.set_index("id")["title"].to_dict()
    

class PivotBooksDBDataset(Dataset):
    def __init__(self):
        reviews = db.get_all_reviews()
        self.reviews_df = pd.DataFrame(reviews)
        books = db.get_all_books()
        self.books_df = pd.DataFrame(books)
        reg_users = db.get_all_registered_users()
        self.reg_users = pd.DataFrame(reg_users)

        self.ratings = self.reviews_df.drop_duplicates(subset=["user_id", "book_id"]).copy()
        self.ratings_df = self.ratings.copy()

        self.users = self.ratings["user_id"].unique()
        c = 0
        for ru in self.reg_users["id"]:
            print(ru)
            if not ru in self.users:
                self.users = np.append(self.users, str(ru))
                c += 1
        self.books = self.ratings["book_id"].unique()

        self.userid2idx = {o:i for i,o in enumerate(self.users)}
        self.bookid2idx = {o:i for i,o in enumerate(self.books)}

        self.idx2userid = {i:o for o,i in self.userid2idx.items()}
        self.idx2bookid = {i:o for o,i in self.bookid2idx.items()}

        # We ignore books without reviews here. It makes sense: how can we
        # suggest a book that no one reviewed?
        self.users_items_pivot_matrix_df = self.ratings.pivot(
                    index="user_id", 
                    columns="book_id", 
                    values="score").fillna(0)
        
        self.X = self.users_items_pivot_matrix_df.to_numpy()
        self.X_suppl = np.zeros((c, self.X.shape[1]))

        self.X = torch.Tensor(np.concatenate([self.X, self.X_suppl]))

    def __getitem__(self, index):
        return self.X[index], self.X[index]

    def __len__(self):
        return self.X.shape[0]

    def get_nums(self):
        n_users = self.users.shape[0]
        n_items = len(self.ratings["book_id"].unique())
        return n_users, n_items

    def get_title_dict(self):
        return self.books_df.set_index("id")["title"].to_dict()
    

class MatrixFactorization(L.LightningModule):
    def __init__(self, n_users, n_items, n_factors=20):
        super().__init__()
        self.user_factors = nn.Embedding(n_users, n_factors) 
        self.item_factors = nn.Embedding(n_items, n_factors)
        
        self.user_factors.weight.data.uniform_(0, 0.05)
        self.item_factors.weight.data.uniform_(0, 0.05)

    def forward(self, data):
        users, items = data[:,0], data[:,1]
        return (self.user_factors(users) * self.item_factors(items)).sum(1)

    def training_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("train_loss", loss, prog_bar=True, on_step=True, on_epoch=True)
        return loss

    def validation_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        val_loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("val_loss", val_loss, prog_bar=True, on_step=True, on_epoch=True)

    def test_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        test_loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("test_loss", test_loss, prog_bar=True, on_step=True, on_epoch=True)

    def configure_optimizers(self):
        optimizer = torch.optim.Adam(self.parameters(), lr=1e-3)
        return optimizer
    

class Encoder(nn.Module):
    def __init__(self, options, dropout_p=0.5, q_dims=[20108, 600, 200]):
        super().__init__()
        self.options = options
        self.q_dims = q_dims

        self.dropout = nn.Dropout(p=dropout_p, inplace=False)
        self.linear_1 = nn.Linear(self.q_dims[0], self.q_dims[1], bias=True)
        self.linear_2 = nn.Linear(self.q_dims[1], self.q_dims[2] * 2, bias=True)
        self.tanh = nn.Tanh()

        for module_name, m in self.named_modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight.data)
                if m.bias is not None:
                    m.bias.data.normal_(0.0, 0.001)

    def forward(self, x):
        x = self.dropout(x)
        x = self.linear_1(x)
        x = self.tanh(x)
        x = self.linear_2(x)
        mu_q, logvar_q = torch.chunk(x, chunks=2, dim=1)
        return mu_q, logvar_q


class Decoder(nn.Module):
    def __init__(self, options, p_dims=[200, 600, 20108]):
        super().__init__()
        self.options = options
        self.p_dims = p_dims

        self.linear_1 = nn.Linear(self.p_dims[0], self.p_dims[1], bias=True)
        self.linear_2 = nn.Linear(self.p_dims[1], self.p_dims[2], bias=True)
        self.tanh = nn.Tanh()

        for module_name, m in self.named_modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight.data)
                if m.bias is not None:
                    m.bias.data.normal_(0.0, 0.001)

    def forward(self, x):
        x = self.linear_1(x)
        x = self.tanh(x)
        x = self.linear_2(x)
        return x

class MultiVAE(L.LightningModule):
    def __init__(self, n_items, weight_decay=0.0, dropout_p=0.5, 
                 q_dims=[20108, 600, 200], p_dims=[200, 600, 20108]):
        super().__init__()
        q_dims = [int(n_items / (i ** 2)) for i in range(1, 4)]
        p_dims = q_dims[::-1]
        
        self.weight_decay = weight_decay
        self.q_dims = q_dims
        self.p_dims = p_dims

        self.encoder = Encoder(None, dropout_p=dropout_p, q_dims=q_dims)
        self.decoder = Decoder(None, p_dims=p_dims)

    def forward(self, x):
        x = nn.functional.normalize(x, p=2, dim=1)

        mu_q, logvar_q = self.encoder.forward(x)
        std_q = torch.exp(0.5 * logvar_q)
        KL = torch.mean(
            torch.sum(0.5 * (-logvar_q + torch.exp(logvar_q) + mu_q ** 2 - 1), dim=1))
        epsilon = torch.randn_like(std_q, requires_grad=False)

        if self.training:
            sampled_z = mu_q + epsilon * std_q
        else:
            sampled_z = mu_q

        logits = self.decoder.forward(sampled_z)

        return logits
    
    def training_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("train_loss", loss, prog_bar=True, on_step=True, on_epoch=True)
        return loss

    def validation_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        val_loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("val_loss", val_loss, prog_bar=True, on_step=True, on_epoch=True)

    def test_step(self, batch, batch_idx):
        X, y = batch
        y_hat = self(X)
        test_loss = nn.functional.mse_loss(y_hat.float(), y.float())
        self.log("test_loss", test_loss, prog_bar=True, on_step=True, on_epoch=True)

    def configure_optimizers(self):
        optimizer = torch.optim.Adam(self.parameters(), lr=1e-3)
        return optimizer
    

class Encoder(nn.Module):
    def __init__(self, options, dropout_p=0.5, q_dims=[20108, 600, 200]):
        super().__init__()
        self.options = options
        self.q_dims = q_dims

        self.dropout = nn.Dropout(p=dropout_p, inplace=False)
        self.linear_1 = nn.Linear(self.q_dims[0], self.q_dims[1], bias=True)
        self.linear_2 = nn.Linear(self.q_dims[1], self.q_dims[2] * 2, bias=True)
        self.tanh = nn.Tanh()

        for module_name, m in self.named_modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight.data)
                if m.bias is not None:
                    m.bias.data.normal_(0.0, 0.001)

    def forward(self, x):
        x = self.dropout(x)
        x = self.linear_1(x)
        x = self.tanh(x)
        x = self.linear_2(x)
        mu_q, logvar_q = torch.chunk(x, chunks=2, dim=-1)
        return mu_q, logvar_q


class Decoder(nn.Module):
    def __init__(self, options, p_dims=[200, 600, 20108]):
        super().__init__()
        self.options = options
        self.p_dims = p_dims

        self.linear_1 = nn.Linear(self.p_dims[0], self.p_dims[1], bias=True)
        self.linear_2 = nn.Linear(self.p_dims[1], self.p_dims[2], bias=True)
        self.tanh = nn.Tanh()

        for module_name, m in self.named_modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight.data)
                if m.bias is not None:
                    m.bias.data.normal_(0.0, 0.001)

    def forward(self, x):
        x = self.linear_1(x)
        x = self.tanh(x)
        x = self.linear_2(x)
        return x


class MultiVAE(L.LightningModule):
    """Code adapted from https://github.com/cydonia999/variational-autoencoders-for-collaborative-filtering-pytorch 
    """
    def __init__(self, n_items, weight_decay=0.0, dropout_p=0.5, 
                 q_dims=[20108, 600, 200], p_dims=[200, 600, 20108],
                 total_anneal_steps=200000, anneal_cap=0.2,
                 start_step=0):
        super().__init__()
        q_dims = [int(n_items / (i ** 2)) for i in range(1, 4)]
        p_dims = q_dims[::-1]
        
        self.weight_decay = weight_decay
        self.q_dims = q_dims
        self.p_dims = p_dims
        self.total_anneal_steps = total_anneal_steps
        self.anneal_cap = anneal_cap
        self.start_step = start_step
        self.step = start_step

        self.encoder = Encoder(None, dropout_p=dropout_p, q_dims=q_dims)
        self.decoder = Decoder(None, p_dims=p_dims)

    def forward(self, x):
        x = nn.functional.normalize(x, p=2, dim=-1)

        mu_q, logvar_q = self.encoder.forward(x)
        std_q = torch.exp(0.5 * logvar_q)
        KL = torch.mean(
            torch.sum(0.5 * (-logvar_q + torch.exp(logvar_q) + mu_q ** 2 - 1), dim=-1))
        epsilon = torch.randn_like(std_q, requires_grad=False)

        if self.training:
            sampled_z = mu_q + epsilon * std_q
        else:
            sampled_z = mu_q

        logits = self.decoder.forward(sampled_z)

        return logits, KL
    
    def get_l2_reg(self):
        l2_reg = Variable(torch.FloatTensor(1), requires_grad=True)
        if self.weight_decay > 0:
            for k, m in self.state_dict().items():
                if k.endswith(".weight"):
                    l2_reg = l2_reg + torch.norm(m, p=2) ** 2
        return self.weight_decay * l2_reg[0]
    
    def training_step(self, batch, batch_idx):
        self.step += 1
        X, y = batch
        logits, KL = self(X)
        loss = self.multivae_loss(logits, KL, X)
        self.log("train_loss", loss, prog_bar=True, on_step=True, on_epoch=True)
        return loss

    def configure_optimizers(self):
        optimizer = torch.optim.Adam(self.parameters(), lr=1e-3)
        return optimizer
    
    def multivae_loss(self, logits, KL, data_tr):
        log_softmax_var = functional.log_softmax(logits, dim=-1)
        neg_ll = - torch.mean(torch.sum(log_softmax_var * data_tr, dim=-1))
        l2_reg = self.get_l2_reg()

        if self.total_anneal_steps > 0:
            self.anneal = min(self.anneal_cap, 1. * self.step / self.total_anneal_steps)
        else:
            self.anneal = self.anneal_cap

        loss = neg_ll + self.anneal * KL + l2_reg
        return loss


def get_recommended_nnmf(user_id, max_epochs=20, k=5):
    dataset = BooksDBDataset()
    n_users, n_items = dataset.get_nums()
    train_dataloader = DataLoader(dataset, 128, shuffle=True)
    mf = MatrixFactorization(n_users, n_items, n_factors=8)
    trainer = L.Trainer(
        max_epochs=max_epochs,
        num_sanity_val_steps=0
    )
    trainer.fit(mf, train_dataloader)

    read_ids = dataset.ratings_df[dataset.ratings_df["user_id"] == user_id]["book_id"].to_numpy()
    read_idx = [dataset.bookid2idx[id] for id in read_ids]
    # title_dict = dataset.get_title_dict()

    user_idx = dataset.userid2idx[user_id]
    user_embeddings = mf.user_factors.weight
    user_embedding = user_embeddings[user_idx]
    item_embeddings = mf.item_factors.weight

    scores = torch.matmul(user_embedding, item_embeddings.T)
    sorted_scores, indices = torch.sort(scores, descending=True)
    recommendable_ids = [i for i in indices if i not in read_idx]
    recommended_ids = recommendable_ids[:min(k, len(recommendable_ids))]

    rows = []
    for row in dataset.books_df.iloc[recommended_ids].iterrows():
        rows.append(dict(row[1]))
    return rows


def get_recommended_nmf(user_id, k=5):
    print("get_recommended_nmf: user_id", user_id)

    dataset = PivotBooksDBDataset()
    nmf = NMF(n_components=20, random_state=42)
    print("dataset userid2idx: ", dataset.userid2idx)
    print("dataset.userid2idx[user_id]: ", dataset.userid2idx[user_id])

    W = nmf.fit_transform(dataset.X)
    H = nmf.components_
    
    read_ids = dataset.ratings_df[dataset.ratings_df["user_id"] == user_id]["book_id"].to_numpy()
    read_idx = [dataset.bookid2idx[id] for id in read_ids]
    # title_dict = dataset.get_title_dict()

    user_embedding = W[dataset.userid2idx[user_id]]

    scores = torch.matmul(torch.Tensor(user_embedding), torch.Tensor(H))
    sorted_scores, indices = torch.sort(scores, descending=True)
    recommendable_ids = [i for i in indices if i not in read_idx]
    recommended_ids = recommendable_ids[:min(k, len(recommendable_ids))]

    rows = []
    for row in dataset.books_df.iloc[recommended_ids].iterrows():
        rows.append(dict(row[1]))
    return rows


def get_recommended_multivae(user_id, max_epochs=30, k=5):
    dataset = PivotBooksDBDataset()
    train_dataloader = DataLoader(dataset, 128, shuffle=True)
    n_users, n_items = dataset.get_nums()
    model = MultiVAE(n_items)
    trainer = L.Trainer(
        max_epochs=max_epochs,
        num_sanity_val_steps=0
    )
    trainer.fit(model, train_dataloader)
    
    read_ids = dataset.ratings_df[dataset.ratings_df["user_id"] == user_id]["book_id"].to_numpy()
    read_idx = [dataset.bookid2idx[id] for id in read_ids]
    # title_dict = dataset.get_title_dict()

    user_row = dataset.X[dataset.userid2idx[user_id]]
    scores = model(user_row)[0]

    sorted_scores, indices = torch.sort(scores, descending=True)
    recommendable_ids = [i for i in indices if i not in read_idx]
    recommended_ids = recommendable_ids[:min(k, len(recommendable_ids))]

    rows = []
    for row in dataset.books_df.iloc[recommended_ids].iterrows():
        rows.append(dict(row[1]))
    return rows