export default class CommunicationController {
    static BASE_URL = "";
    
    static async genericRequest(endpoint, verb, queryParams, bodyParams) {
        const queryParamsFormatted = new URLSearchParams(queryParams).toString();
        const url = this.BASE_URL + endpoint + (queryParamsFormatted ? "?" + queryParamsFormatted : "");
        console.log("sending " + verb + " request to: " + url);
        
        let fatchData = {
            method: verb,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
        if (verb !== "GET") {
            fatchData.body = JSON.stringify(bodyParams);
        }
        let httpResponse = await fetch(url, fatchData);
    
        const status = httpResponse.status;
        if (status === 200) {
            let deserializedObject = await httpResponse.json();
            return deserializedObject;
        } else {
            //console.log(httpResponse);
            const message = await httpResponse.text();
            let error = new Error("Error message from the server. HTTP status: " + status + " " + message);
            console.log("Error in CC:", error)
            throw error;
        }
    }

    static async register() {
        const endPoint = "users";
        const verb = "POST";
        const queryParams = {};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getUsers(sid, lat, lon) {
        const endPoint = "users/";
        const verb = "GET";
        const queryParams = {sid: sid, lat: lat, lon: lon};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getBooks(bookFilter, sortAttribute, sortDirection) {
        console.log("bookFilter in controller: ", bookFilter)
        const endPoint = "books";
        const verb = "GET";
        const queryParams = {...bookFilter, sortAttribute, sortDirection};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async deleteBook(id) {
        const endPoint = "delete_book/" + id;
        const verb = "DELETE";
        const queryParams = {};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async addBook(formValues) {
        const endPoint = "add_book";
        const verb = "POST";
        const queryParams = {};
        const bodyParams = formValues;
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async editBook(formValues) {
        const endPoint = "edit_book";
        const verb = "PUT";
        const queryParams = {};
        const bodyParams = formValues;
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async addUser(formValues) {
        const endPoint = "add_user";
        const verb = "POST";
        const queryParams = {};
        const bodyParams = formValues;
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async authUser(formValues) {
        const endPoint = "auth_user";
        const verb = "PUT";
        const queryParams = {};
        const bodyParams = formValues;
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getReviews(book_id) {
        const endPoint = "reviews/" + book_id;
        const verb = "GET";
        const queryParams = {};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async addReview(reviewValues) {
        const endPoint = "add_review";
        const verb = "POST";
        const queryParams = {};
        const bodyParams = reviewValues;
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getUserReviews(userId, sortAttribute, sortDirection) {
        const endPoint = "user_reviews";
        const verb = "GET";
        const queryParams = {userId, sortAttribute, sortDirection};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async increaseUserSpend(userId, total) {
        const endPoint = "increase_user_spend";
        const verb = "PUT";
        const queryParams = {};
        const bodyParams = {userId, total};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getRecommendations(userId, modelName) {
        const endPoint = "recommendations";
        const verb = "GET";
        const queryParams = {userId, modelName};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getTopics(bookId) {
        const endPoint = "topics";
        const verb = "GET";
        const queryParams = {bookId};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async addBookmark(userId, bookId) {
        const endPoint = "add_bookmark";
        const verb = "POST";
        const queryParams = {};
        const bodyParams = {userId, bookId};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async deleteBookmark(userId, bookId) {
        const endPoint = "delete_bookmark";
        const verb = "DELETE";
        const queryParams = {};
        const bodyParams = {userId, bookId};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getUserBookmarks(userId, attribute, direction) {
        const endPoint = "bookmarks";
        const verb = "GET";
        const queryParams = {userId, attribute, direction};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async hasBookmark(userId, bookId) {
        const endPoint = "has_bookmark";
        const verb = "GET";
        const queryParams = {userId, bookId};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }
}


    