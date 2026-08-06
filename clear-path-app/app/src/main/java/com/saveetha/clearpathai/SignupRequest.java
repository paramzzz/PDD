package com.saveetha.clearpathai;

public class SignupRequest {

    private String name;
    private String email;
    private String phone;
    private String clinic_name;
    private String doctor_license_id;
    private String password;

    public SignupRequest(String name,
                         String email,
                         String phone,
                         String clinic_name,
                         String doctor_license_id,
                         String password) {

        this.name = name;
        this.email = email;
        this.phone = phone;
        this.clinic_name = clinic_name;
        this.doctor_license_id = doctor_license_id;
        this.password = password;
    }
}