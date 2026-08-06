package com.saveetha.clearpathai;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientQueueFragment extends Fragment implements View.OnClickListener {

    private RecyclerView rvPatientQueue;
    private PatientAdapter adapter;
    private TextView tvQueueSummary;
    private TextView chipAll, chipStat, chipHigh, chipMed, chipLow;
    private TextView selectedChip;

    // Master list containing live backend values
    private List<PatientDetailFetchResponse> masterPatientList = new ArrayList<>();

    public PatientQueueFragment() {}

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_queue, container, false);

        // Bind Views
        rvPatientQueue = view.findViewById(R.id.rvPatientQueue);
        tvQueueSummary = view.findViewById(R.id.tvQueueSummary);
        chipAll = view.findViewById(R.id.chipAll);
        chipStat = view.findViewById(R.id.chipStat);
        chipHigh = view.findViewById(R.id.chipHigh);
        chipMed = view.findViewById(R.id.chipMed);
        chipLow = view.findViewById(R.id.chipLow);

        // Setup Listeners
        chipAll.setOnClickListener(this);
        chipStat.setOnClickListener(this);
        chipHigh.setOnClickListener(this);
        chipMed.setOnClickListener(this);
        chipLow.setOnClickListener(this);

        selectedChip = chipAll;

        // Initialize Recycler Layer
        rvPatientQueue.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new PatientAdapter(new ArrayList<>());
        rvPatientQueue.setAdapter(adapter);

        // Handle item click events to switch to detail fragment view cleanly
        adapter.setOnItemClickListener(patient -> {
            PatientDetailFragment detailFragment = PatientDetailFragment.newInstance(patient.getId());

            if (getParentFragmentManager() != null) {
                getParentFragmentManager().beginTransaction()
                        .replace(R.id.frameLayout, detailFragment) // Ensure R.id.fragment_container matches your MainActivity container layout ID
                        .addToBackStack(null) // Keeps the navigation history intact so users can press back to return here
                        .commit();
            }
        });

        // Fetch live cards from your backend ApiClient instance
        fetchPatientsFromBackend();

        return view;
    }

    private void fetchPatientsFromBackend() {
        tvQueueSummary.setText("Loading live patient queue...");

        // Link with your ApiClient instance configuration directly
        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        apiService.getActivePatients().enqueue(new Callback<List<PatientDetailFetchResponse>>() {
            @Override
            public void onResponse(@NonNull Call<List<PatientDetailFetchResponse>> call, @NonNull Response<List<PatientDetailFetchResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    masterPatientList.clear();
                    masterPatientList.addAll(response.body());

                    // Re-calculate tab indicators with fresh database numbers
                    updateChipCounts();

                    // Render default list display sequence
                    filterQueueList("All");
                } else {
                    tvQueueSummary.setText("Failed to extract data payload.");
                    if (getContext() != null) {
                        Toast.makeText(getContext(), "Server error code: " + response.code(), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<PatientDetailFetchResponse>> call, @NonNull Throwable t) {
                Log.e("PatientQueueFragment", "Network Link Error: ", t);
                tvQueueSummary.setText("Error updating cards.");
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Network link failed. Check your internet connection.", Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private void updateChipCounts() {
        int countAll = masterPatientList.size();
        int countStat = 0;
        int countHigh = 0;
        int countMed = 0;
        int countLow = 0;

        // Tally categories based on structural values returned from MySQL backend
        for (PatientDetailFetchResponse item : masterPatientList) {
            String risk = item.getInitialRisk();
            if (risk != null) {
                if (risk.equalsIgnoreCase("STAT")) {
                    countStat++;
                } else if (risk.equalsIgnoreCase("High")) {
                    countHigh++;
                } else if (risk.equalsIgnoreCase("Medium") || risk.equalsIgnoreCase("Med")) {
                    countMed++;
                } else if (risk.equalsIgnoreCase("Low")) {
                    countLow++;
                }
            }
        }

        // Apply calculated integers directly to target text string layers
        chipAll.setText("All " + countAll);
        chipStat.setText("STAT " + countStat);
        chipHigh.setText("High " + countHigh);
        chipMed.setText("Med " + countMed);
        chipLow.setText("Low " + countLow);
    }

    @Override
    public void onClick(View v) {
        // Toggle selected active chips styles programmatically
        updateChipSelectionStyle((TextView) v);

        int viewId = v.getId();
        if (viewId == R.id.chipAll) {
            filterQueueList("All");
        } else if (viewId == R.id.chipStat) {
            filterQueueList("STAT");
        } else if (viewId == R.id.chipHigh) {
            filterQueueList("High");
        } else if (viewId == R.id.chipMed) {
            filterQueueList("Medium");
        } else if (viewId == R.id.chipLow) {
            filterQueueList("Low");
        }
    }

    private void filterQueueList(String categoryKey) {
        List<PatientDetailFetchResponse> filteredList = new ArrayList<>();

        for (PatientDetailFetchResponse item : masterPatientList) {
            if (categoryKey.equalsIgnoreCase("All") || item.getInitialRisk().equalsIgnoreCase(categoryKey)) {
                filteredList.add(item);
            }
        }

        // Push data model updates into Recycler adapter layers
        adapter.updateList(filteredList);

        // Updates the text header context description dynamically
        if (categoryKey.equalsIgnoreCase("All")) {
            tvQueueSummary.setText(masterPatientList.size() + " active · sorted by risk score");
        } else {
            tvQueueSummary.setText(filteredList.size() + " active items displayed");
        }
    }

    private void updateChipSelectionStyle(TextView targetChip) {
        // Reset old item rendering state metrics back to unselected resource states
        selectedChip.setBackgroundResource(R.drawable.chip_inactive_bg);
        selectedChip.setTextColor(Color.parseColor("#DFF7FB"));

        // Configure newly tapped target items with structural selection borders
        targetChip.setBackgroundResource(R.drawable.chip_active_bg);
        targetChip.setTextColor(Color.parseColor("#FFFFFF"));

        selectedChip = targetChip;
    }
}