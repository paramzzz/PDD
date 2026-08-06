package com.saveetha.clearpathai;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardFragment extends Fragment {

    // Declare the text views
    private TextView greeting,txtDoctorName, txtCurrentDateTime;
    private TextView txtStatCount, txtPendingCount, txtClearedCount, txtActiveCount;

    public DashboardFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater,
                             ViewGroup container,
                             Bundle savedInstanceState) {

        // 1. Inflate the layout for this fragment
        View view = inflater.inflate(
                R.layout.fragment_dashboard,
                container,
                false
        );

        // 2. Bind the TextViews from the XML layout
        txtDoctorName = view.findViewById(R.id.txtDoctorName);
        txtCurrentDateTime = view.findViewById(R.id.txtCurrentDateTime);
        greeting = view.findViewById(R.id.greeting);
        greeting.setText(getGreetingBasedOnTime());
        txtStatCount = view.findViewById(R.id.txtStatCount);
        txtPendingCount = view.findViewById(R.id.txtPendingCount);
        txtClearedCount = view.findViewById(R.id.txtClearedCount);
        txtActiveCount = view.findViewById(R.id.txtActiveCount);

        // 3. Extract the doctor's full name from SharedPreferences
        if (getActivity() != null) {
            SharedPreferences sharedPreferences = getActivity().getSharedPreferences("DoctorPrefs", Context.MODE_PRIVATE);

            // "Doctor" is used as a fallback if the name is not found
            String doctorName = sharedPreferences.getString("full_name", "Doctor");

            // Set the dynamic name text
            txtDoctorName.setText("Dr. " + doctorName);
        }

        // 4. Generate and display the current live real-time date string
        String currentFormattedDate = getCurrentDateTimeString();
        txtCurrentDateTime.setText(currentFormattedDate + " · Hospital Command Center");

        // 5. Setup Quick Action Click Listener (New Patient)
        LinearLayout newPatientCard = view.findViewById(R.id.card_new_patient);
        LinearLayout scanDocsCard = view.findViewById(R.id.card_scan_docs);
        LinearLayout patientQueueCard = view.findViewById(R.id.card_patient_queue);
        LinearLayout aiAlertsCard = view.findViewById(R.id.card_ai_alerts);

        newPatientCard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment newPatientFragment = new NewPatientFragment();
                FragmentTransaction transaction = getParentFragmentManager().beginTransaction();
                transaction.replace(R.id.frameLayout, newPatientFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });
        scanDocsCard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment documentBundleFragment = new DocumentBundleFragment();
                FragmentTransaction transaction = getParentFragmentManager().beginTransaction();
                transaction.replace(R.id.frameLayout, documentBundleFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });
        patientQueueCard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment patientQueueFragment = new PatientQueueFragment();
                FragmentTransaction transaction = getParentFragmentManager().beginTransaction();
                transaction.replace(R.id.frameLayout, patientQueueFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });
        aiAlertsCard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Fragment alertsFragment = new AlertsFragment();
                FragmentTransaction transaction = getParentFragmentManager().beginTransaction();
                transaction.replace(R.id.frameLayout, alertsFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });


        fetchMetricsFromBackend();

        return view;
    }
    private void fetchMetricsFromBackend() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        apiService.getDashboardStats().enqueue(new Callback<DashboardStatsResponse>() {
            @Override
            public void onResponse(@NonNull Call<DashboardStatsResponse> call, @NonNull Response<DashboardStatsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    DashboardStatsResponse stats = response.body();

                    // Apply raw integer returns dynamically to UI display layer
                    txtStatCount.setText(String.valueOf(stats.getStatPatients()));
                    txtPendingCount.setText(String.valueOf(stats.getPendingApproval()));
                    txtClearedCount.setText(String.valueOf(stats.getClearedToday()));
                    txtActiveCount.setText(String.valueOf(stats.getActiveCases()));
                }
            }

            @Override
            public void onFailure(@NonNull Call<DashboardStatsResponse> call, @NonNull Throwable t) {
                Log.e("DashboardFragment", "Failed to retrieve command statistics metrics over network link: ", t);
            }
        });
    }

    /**
     * Helper method to parse system time into explicit visual formatting.
     * Generates structures matching: "Monday, 25 May"
     */
    private String getGreetingBasedOnTime() {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);

        if (hour >= 4 && hour < 12) {
            return "Good morning,";
        } else if (hour >= 12 && hour < 17) {
            return "Good afternoon,";
        } else {
            return "Good evening,";
        }
    }

    /**
     * Helper method to parse system time into explicit visual formatting.
     * Generates structures matching: "Monday, 25 May"
     */
    private String getCurrentDateTimeString() {
        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d MMM", Locale.getDefault());
        return sdf.format(new Date());
    }
}