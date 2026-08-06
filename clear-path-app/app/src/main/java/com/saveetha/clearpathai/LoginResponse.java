package com.saveetha.clearpathai;

public class LoginResponse {

    private boolean success;
    private String message;
    private int user_id;
    private String fullname;

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public int getUser_id() {
        return user_id;
    }
    public String getFull_name(){return fullname;}
}