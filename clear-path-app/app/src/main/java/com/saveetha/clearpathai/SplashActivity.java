package com.saveetha.clearpathai;


import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_TIME = 3000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {

                // Navigate to MainActivity
                Intent intent = new Intent(SplashActivity.this, SplashActivity1.class);
                startActivity(intent);

                finish();
            }
        }, SPLASH_TIME);
    }
}