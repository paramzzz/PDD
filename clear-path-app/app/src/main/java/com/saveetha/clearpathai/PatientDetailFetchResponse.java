package com.saveetha.clearpathai;

public class PatientDetailFetchResponse {
    private int id;
    private String full_name;
    private String age;
    private String gender;
    private String chief_complaint;
    private String initial_risk;
    private String bp;
    private String hr;
    private String temperature;
    private String spo2;
    private String time_elapsed; // e.g., "8m ago", calculated server side

    private String insurance_provider;
    private String policy_number;
    private String insurance_status;
    private String finance_status;
    private String clinical_status;
    private String pre_op_status;
    private String approval_status;
    private int co_pay;
    private int coverage_percent;
    private int unpaid_dues;
    private String coverage_details;

    public PatientDetailFetchResponse(int id, String full_name, String age, String gender, 
                                      String chief_complaint, String initial_risk, String bp, 
                                      String hr, String temperature, String spo2, String time_elapsed) {
        this.id = id;
        this.full_name = full_name;
        this.age = age;
        this.gender = gender;
        this.chief_complaint = chief_complaint;
        this.initial_risk = initial_risk;
        this.bp = bp;
        this.hr = hr;
        this.temperature = temperature;
        this.spo2 = spo2;
        this.time_elapsed = time_elapsed;
    }

    // Getters and Setters
    public int getId() { return id; }
    public String getFullName() { return full_name; }
    public String getAge() { return age; }
    public String getGender() { return gender; }
    public String getChiefComplaint() { return chief_complaint; }
    public String getInitialRisk() { return initial_risk; }
    public String getBp() { return bp; }
    public String getHr() { return hr; }
    public String getTemperature() { return temperature; }
    public String getSpo2() { return spo2; }
    public String getTimeElapsed() { return time_elapsed; }

    public String getInsuranceProvider() { return insurance_provider; }
    public String getPolicyNumber() { return policy_number; }
    public String getInsuranceStatus() { return insurance_status; }
    public String getFinanceStatus() { return finance_status; }
    public String getClinicalStatus() { return clinical_status; }
    public String getPreOpStatus() { return pre_op_status; }
    public String getApprovalStatus() { return approval_status; }
    public int getCoPay() { return co_pay; }
    public int getCoveragePercent() { return coverage_percent; }
    public int getUnpaidDues() { return unpaid_dues; }
    public String getCoverageDetails() { return coverage_details; }
}