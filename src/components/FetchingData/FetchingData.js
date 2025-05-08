import './FetchingData.css'

const FetchingData = () => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div
                    className="spinner-border text-primary loading-spinner"
                    role="status"
                >
                    <span className="visually-hidden">Fetching data...</span>
                </div>
                <div className="loading-text mt-3">
                    <span className="text-primary fs-5 fw-semibold">
                        Fetching data...
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FetchingData;