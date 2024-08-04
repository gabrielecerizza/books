import { useEffect, useState } from 'react';


export function Pagination({ createList, data, currentPageNumber, setCurrentPageNumber }) {
    // const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const TOTAL_VALUES_PER_PAGE = 10;
  
    function goOnPrevPage() {
      if (currentPageNumber === 1) return;
      setCurrentPageNumber((prev) => prev - 1);
    }
    function goOnNextPage() {
      if (currentPageNumber === Math.ceil(data.length / TOTAL_VALUES_PER_PAGE)) return;
      setCurrentPageNumber((prev) => prev + 1);
    }
  
    useEffect(() => {
      const start = (currentPageNumber - 1) * TOTAL_VALUES_PER_PAGE;
      const end = currentPageNumber * TOTAL_VALUES_PER_PAGE;
      setDataToDisplay(data.slice(start, end));
    }, [data, currentPageNumber])

    return (
      <div>
          <div>
            {createList(dataToDisplay)}
            <div className="flex join justify-center mb-2" id="btn-container">
              <button className="join-item btn" onClick={goOnPrevPage}>«</button>
              <button className="join-item btn">Page {currentPageNumber}</button>
              <button className="join-item btn" onClick={goOnNextPage}>»</button>
            </div>
          </div>
      </div>
    )
}