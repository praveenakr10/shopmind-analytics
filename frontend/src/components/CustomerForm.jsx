import React, { useState } from "react";
import { useAnalysis } from "../context/AnalysisContext";

function CustomerForm({ options, onSuccess, loading }) {
  const { analyzeCustomer, error: contextError } = useAnalysis();
  const [localError, setLocalError] = useState(null);
  const [formData, setFormData] = useState({
    Age: 30,
    Purchase_Amount: 60,
    Previous_Purchases: 10,
    Review_Rating: 4.5,
    Frequency_Score: 3,
    Subscription_Status: 1,
    Discount_Applied: 1,
    Promo_Code_Used: 1,
    Payment_Method: "",
    Shipping_Type: "",
    Season: "",
    Gender: "",
    Category: "",
    external_context: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate required fields
    if (!formData.Payment_Method || !formData.Shipping_Type || !formData.Season || !formData.Gender || !formData.Category) {
      setLocalError("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        Age: Number(formData.Age),
        Purchase_Amount: Number(formData.Purchase_Amount),
        Previous_Purchases: Number(formData.Previous_Purchases),
        Review_Rating: Number(formData.Review_Rating),
        Frequency_Score: Number(formData.Frequency_Score),
        Subscription_Status: Number(formData.Subscription_Status),
        Discount_Applied: Number(formData.Discount_Applied),
        Promo_Code_Used: Number(formData.Promo_Code_Used)
      };
      
      const result = await analyzeCustomer(payload);
      onSuccess?.(result);
    } catch (error) {
      setLocalError(error.message || "Failed to analyze customer. Please try again.");
      console.error("Customer analysis error:", error);
    }
  };

  const renderInput = (label, name, type = "number", step = "1") => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input 
        id={name}
        name={name} 
        type={type}
        step={step}
        value={formData[name]}
        onChange={handleChange}
        required 
      />
    </div>
  );

  const renderSelect = (label, name, values) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select 
        id={name}
        name={name} 
        value={formData[name] || ""}
        onChange={handleChange} 
        required
      >
        <option value="">Select {label}</option>
        {values?.map((val, idx) => (
          <option key={idx} value={val}>{val}</option>
        ))}
      </select>
    </div>
  );

  const displayError = localError || contextError;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Customer Information</h2>
      
      {displayError && (
        <div className="error-alert" style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.5rem" }}>
          {displayError}
        </div>
      )}

      <div className="grid">
        {renderInput("Age", "Age")}
        {renderInput("Purchase Amount ($)", "Purchase_Amount", "number", "0.01")}
        {renderInput("Previous Purchases", "Previous_Purchases")}
        {renderInput("Review Rating (0-5)", "Review_Rating", "number", "0.1")}
        {renderInput("Frequency Score (1-5)", "Frequency_Score")}
        {renderInput("Subscription Status (0/1)", "Subscription_Status")}
        {renderInput("Discount Applied (0/1)", "Discount_Applied")}
        {renderInput("Promo Code Used (0/1)", "Promo_Code_Used")}

        {renderSelect("Category", "Category", options.Category)}
        {renderSelect("Payment Method", "Payment_Method", options["Payment Method"])}
        {renderSelect("Shipping Type", "Shipping_Type", options["Shipping Type"])}
        {renderSelect("Season", "Season", options.Season)}
        {renderSelect("Gender", "Gender", options.Gender)}

        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label htmlFor="external_context">Market Context</label>
          <textarea
            id="external_context"
            name="external_context"
            placeholder="Enter any additional market context or customer notes..."
            value={formData.external_context}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Analyzing..." : "Generate Strategy"}
      </button>
    </form>
  );
}

export default CustomerForm;
