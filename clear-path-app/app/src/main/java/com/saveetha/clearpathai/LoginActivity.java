package com.saveetha.clearpathai;

import static android.content.ContentValues.TAG;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.saveetha.clearpathai.ApiClient;
import com.saveetha.clearpathai.ApiService;
import com.saveetha.clearpathai.LoginRequest;
import com.saveetha.clearpathai.LoginResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    EditText email, password;
    Button loginBtn;
    TextView txtRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        email = findViewById(R.id.email);
        password = findViewById(R.id.password);
        loginBtn = findViewById(R.id.loginBtn);
        txtRegister = findViewById(R.id.txtRegister);

        // Login Click
        loginBtn.setOnClickListener(v -> loginUser());

        // Register Click
        txtRegister.setOnClickListener(v -> {

            Intent intent =
                    new Intent(LoginActivity.this,
                            SigninActivity.class);

            startActivity(intent);
        });
    }

    private void loginUser() {

        String userEmail =
                email.getText().toString().trim();

        String userPassword =
                password.getText().toString().trim();

        // Email Validation
        if(userEmail.isEmpty()) {

            email.setError("Enter Email");
            email.requestFocus();
            return;
        }

        if(!Patterns.EMAIL_ADDRESS
                .matcher(userEmail)
                .matches()) {

            email.setError("Invalid Email");
            email.requestFocus();
            return;
        }

        // Password Validation
        if(userPassword.isEmpty()) {

            password.setError("Enter Password");
            password.requestFocus();
            return;
        }

        // Create Request Object
        LoginRequest request =
                new LoginRequest(
                        userEmail,
                        userPassword
                );

        // Retrofit API Call
        ApiService apiService =
                ApiClient
                        .getClient()
                        .create(ApiService.class);

        Call<LoginResponse> call =
                apiService.loginUser(request);

        call.enqueue(new Callback<LoginResponse>() {

            @Override
            public void onResponse(
                    Call<LoginResponse> call,
                    Response<LoginResponse> response) {

                if(response.isSuccessful()
                        && response.body() != null) {

                    LoginResponse loginResponse =
                            response.body();

                    if(loginResponse.isSuccess()) {

                        Toast.makeText(
                                LoginActivity.this,
                                loginResponse.getMessage(),
                                Toast.LENGTH_SHORT
                        ).show();
                        android.content.SharedPreferences sharedPreferences =
                                getSharedPreferences("DoctorPrefs", MODE_PRIVATE);
                        android.content.SharedPreferences.Editor editor = sharedPreferences.edit();

                        // Save User ID and Full Name
                        editor.putInt("user_id", loginResponse.getUser_id());
                        editor.putString("full_name", loginResponse.getFull_name());
                        editor.apply();
                        Toast.makeText(
                                LoginActivity.this, // context
                                loginResponse.getFull_name() + " Logged in", // message
                                Toast.LENGTH_SHORT // duration
                        ).show();

                        // Open Dashboard
                       Intent intent =
                               new Intent(
                                       LoginActivity.this,
                                       MainActivity.class);

                        startActivity(intent);
                        finish();

                    } else {

                        Toast.makeText(
                                LoginActivity.this,
                                loginResponse.getMessage(),
                                Toast.LENGTH_SHORT
                        ).show();
                    }

                } else {

                    Toast.makeText(
                            LoginActivity.this,
                            "Server Error",
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }

            @Override
            public void onFailure(
                    Call<LoginResponse> call,
                    Throwable t) {

                Toast.makeText(
                        LoginActivity.this,
                        t.getMessage(),
                        Toast.LENGTH_LONG
                ).show();
            }
        });
    }
}