package com.saveetha.clearpathai;

public class NewPatientRequest {

    private String full_name;
    private String age;
    private String gender;
    private String chief_complaint;
    private String bp;
    private String hr;
    private String temperature;
    private String spo2;
    private String insurance_provider;
    private String policy_number;

    public NewPatientRequest(
            String full_name,
            String age,
            String gender,
            String chief_complaint,
            String bp,
            String hr,
            String temperature,
            String spo2,
            String insurance_provider,
            String policy_number) {

        this.full_name = full_name;
        this.age = age;
        this.gender = gender;
        this.chief_complaint = chief_complaint;
        this.bp = bp;
        this.hr = hr;
        this.temperature = temperature;
        this.spo2 = spo2;
        this.insurance_provider = insurance_provider;
        this.policy_number = policy_number;
    }
}