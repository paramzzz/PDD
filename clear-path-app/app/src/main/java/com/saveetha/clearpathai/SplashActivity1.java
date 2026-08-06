package com.saveetha.clearpathai;


import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity1 extends AppCompatActivity {

    ProgressBar progressBar;
    int progressStatus = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash1);

        progressBar = findViewById(R.id.progressBar);

        new Thread(new Runnable() {
            @Override
            public void run() {

                while (progressStatus < 100) {

                    progressStatus += 2;

                    try {
                        Thread.sleep(60);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    progressBar.setProgress(progressStatus);
                }

                Intent intent = new Intent(SplashActivity1.this, LoginActivity.class);
                startActivity(intent);
                finish();
            }
        }).start();
    }
}