import React, { useState } from "react";
import "./PlaceOrderPage.css"; 

const PlaceOrderPage = () => {
    const [organizationName, setOrganizationName] = useState("");
    const [email, setEmail] = useState("");
    const [numOfAssets, setNumOfAssets] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({
            organizationName,
            email,
            numOfAssets,
            location
        });
        alert("Order placed successfully!");
    };

    return (
        <div className="place-order-container">
            <h2>Place Order</h2>
            <form className="place-order-form" onSubmit={handleSubmit}>
                <div>
                    <label>Organization Name:</label>
                    <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Number of Assets:</label>
                    <input
                        type="number"
                        value={numOfAssets}
                        onChange={(e) => setNumOfAssets(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Location:</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit Order</button>
            </form>
        </div>
    );
};

export default PlaceOrderPage;
