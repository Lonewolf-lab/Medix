package com.medimind.dashboard.dto;

public class BiomarkerValue {
    private String parameter;
    private String value;
    private String unit;
    private String normalRange;
    private String status;
    private String explanation;
    private String category;

    public BiomarkerValue() {}

    public String getParameter() { return parameter; }
    public void setParameter(String parameter) { this.parameter = parameter; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getNormalRange() { return normalRange; }
    public void setNormalRange(String normalRange) { this.normalRange = normalRange; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
