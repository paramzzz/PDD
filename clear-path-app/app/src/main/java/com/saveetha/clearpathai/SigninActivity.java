package com.saveetha.clearpathai;


import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.saveetha.clearpathai.ApiClient;
import com.saveetha.clearpathai.ApiService;
import com.saveetha.clearpathai.SignupRequest;
import com.saveetha.clearpathai.SignupResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SigninActivity extends AppCompatActivity {

    EditText etName, etEmail, etPhone,
            etClinic, etLicense, etPassword;

    Button btnRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signin);

        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etClinic = findViewById(R.id.etClinic);
        etLicense = findViewById(R.id.etLicense);
        etPassword = findViewById(R.id.etPassword);

        btnRegister = findViewById(R.id.btnRegister);

        btnRegister.setOnClickListener(v -> registerUser());
    }

    private void registerUser() {

        String name = etName.getText().toString();
        String email = etEmail.getText().toString();
        String phone = etPhone.getText().toString();
        String clinic = etClinic.getText().toString();
        String license = etLicense.getText().toString();
        String password = etPassword.getText().toString();

        SignupRequest request = new SignupRequest(
                name,
                email,
                phone,
                clinic,
                license,
                password
        );

        ApiService apiService = ApiClient
                .getClient()
                .create(ApiService.class);

        Call<SignupResponse> call =
                apiService.signupUser(request);

        call.enqueue(new Callback<SignupResponse>() {
            @Override
            public void onResponse(Call<SignupResponse> call,
                                   Response<SignupResponse> response) {

                if(response.isSuccessful() &&
                        response.body() != null) {

                    Toast.makeText(
                            SigninActivity.this,
                            response.body().getMessage(),
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }

            @Override
            public void onFailure(Call<SignupResponse> call,
                                  Throwable t) {

                Toast.makeText(
                        SigninActivity.this,
                        t.getMessage(),
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }
}