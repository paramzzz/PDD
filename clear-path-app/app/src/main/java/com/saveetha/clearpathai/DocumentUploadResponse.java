package com.saveetha.clearpathai;

public class DocumentUploadResponse {
    private boolean success;
    private String message;
    private String image_url;

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getImageUrl() { return image_url; }
}