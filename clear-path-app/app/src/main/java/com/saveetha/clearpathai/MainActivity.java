package com.saveetha.clearpathai;


import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.saveetha.clearpathai.DashboardFragment;

public class MainActivity extends AppCompatActivity {

    BottomNavigationView bottomNav;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        bottomNav = findViewById(R.id.bottomNav);

        // Default Fragment
        loadFragment(new DashboardFragment());

        bottomNav.setOnItemSelectedListener(item -> {

            Fragment fragment = null;

            int id = item.getItemId();

            if(id == R.id.nav_home) {

                fragment = new DashboardFragment();

            } else if(id == R.id.nav_patients) {

                fragment = new PatientQueueFragment();

            } else if(id == R.id.nav_upload) {

                fragment = new DocumentBundleFragment();

            } else if(id == R.id.nav_alerts) {

                fragment = new AlertsFragment();
            }

            if(fragment != null) {
                loadFragment(fragment);
            }

            return true;
        });
    }

    private void loadFragment(Fragment fragment) {

        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.frameLayout, fragment)
                .commit();
    }
}