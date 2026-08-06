package com.saveetha.clearpathai;

import com.saveetha.clearpathai.LoginResponse;
import com.saveetha.clearpathai.SignupResponse;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Query;

public interface ApiService {

    @POST("login")
    Call<LoginResponse> loginUser(@Body LoginRequest request);

    @POST("signup")
    Call<SignupResponse> signupUser(@Body SignupRequest request);
    
    @POST("new_patient")
    Call<NewPatientSubmitResponse> submitPatient(@Body NewPatientRequest request);
    
    @GET("/patients")
    Call<List<PatientDetailFetchResponse>> getActivePatients();
    
    @GET("api/patient-detail")
    Call<PatientDetailFetchResponse> getPatientById(@Query("id") int patientId);
    
    @POST("api/patients/run-clearance")
    Call<PatientDetailFetchResponse> runClearance(@Query("id") int patientId);
    
    @POST("api/patients/update-status")
    Call<PatientDetailFetchResponse> updatePatientStatus(
            @Query("id") int patientId,
            @Query("pre_op_status") String preOpStatus,
            @Query("approval_status") String approvalStatus
    );
    
    @Multipart
    @POST("api/upload-document")
    Call<DocumentUploadResponse> uploadPatientDocument(
            @Part("patient_id") RequestBody patientId,
            @Part("document_type") RequestBody documentType,
            @Part MultipartBody.Part file
    );
    
    @GET("api/dashboard-stats")
    Call<DashboardStatsResponse> getDashboardStats();

    @GET("api/nurses")
    Call<List<Object>> getAllNurses();

    @GET("api/notifications")
    Call<List<Object>> getNotifications(@Query("role") String role);
}