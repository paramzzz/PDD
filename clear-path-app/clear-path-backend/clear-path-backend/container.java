package com.saveetha.clearpathai;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.saveetha.clearpathai.PatientDetailFetchResponse;
import java.util.List;

public class PatientAdapter extends RecyclerView.Adapter<PatientAdapter.PatientViewHolder> {

    private List<PatientDetailFetchResponse> dataList;

    public PatientAdapter(List<PatientDetailFetchResponse> dataList) {
        this.dataList = dataList;
    }

    public void updateList(List<PatientDetailFetchResponse> newList) {
        this.dataList = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public PatientViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_patient_card, parent, false);
        return new PatientViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull PatientViewHolder holder, int position) {
        PatientDetailFetchResponse p = dataList.get(position);

        holder.tvPatientName.setText(p.getFullName());
        holder.tvPatientMeta.setText(p.getAge() + " · " + p.getGender() + " · " + p.getTimeElapsed());
        holder.tvComplaintSnippet.setText(p.getChiefComplaint());
        holder.tvBpValue.setText(p.getBp());
        holder.tvSpo2Value.setText("SpO₂ " + p.getSpo2());
        holder.tvRiskTag.setText(p.getInitialRisk().toUpperCase());
        holder.tvAvatar.setText(p.getFullName().substring(0, 1));
    }

    @Override
    public int getItemCount() {
        return dataList.size();
    }

    static class PatientViewHolder extends RecyclerView.ViewHolder {
        TextView tvAvatar, tvPatientName, tvRiskTag, tvPatientMeta, tvComplaintSnippet, tvBpValue, tvSpo2Value;

        public PatientViewHolder(@NonNull View itemView) {
            super(itemView);
            tvAvatar = itemView.findViewById(R.id.tvAvatar);
            tvPatientName = itemView.findViewById(R.id.tvPatientName);
            tvRiskTag = itemView.findViewById(R.id.tvRiskTag);
            tvPatientMeta = itemView.findViewById(R.id.tvPatientMeta);
            tvComplaintSnippet = itemView.findViewById(R.id.tvComplaintSnippet);
            tvBpValue = itemView.findViewById(R.id.tvBpValue);
            tvSpo2Value = itemView.findViewById(R.id.tvSpo2Value);
        }
    }
}

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

    public PatientQueueFragment() {
    }

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
            public void onResponse(@NonNull Call<List<PatientDetailFetchResponse>> call,
                    @NonNull Response<List<PatientDetailFetchResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    masterPatientList.clear();
                    masterPatientList.addAll(response.body());

                    // Render default list display sequence
                    filterQueueList("All");
                } else {
                    tvQueueSummary.setText("Failed to extract data payload.");
                    if (getContext() != null) {
                        Toast.makeText(getContext(), "Server error code: " + response.code(), Toast.LENGTH_SHORT)
                                .show();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<PatientDetailFetchResponse>> call, @NonNull Throwable t) {
                Log.e("PatientQueueFragment", "Network Link Error: ", t);
                tvQueueSummary.setText("Error updating cards.");
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Network link failed. Check your internet connection.",
                            Toast.LENGTH_LONG).show();
                }
            }
        });
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
        tvQueueSummary.setText(filteredList.size() + " active items displayed");
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

package com.saveetha.clearpathai;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import com.saveetha.clearpathai.PatientDetailFetchResponse;

public class PatientDetailFragment extends Fragment {

    private static final String ARG_PATIENT_ID = "patient_id";
    private int patientId;

    private TextView tvDetailName, tvDetailMeta, tvDetailRiskTag;
    private TextView tvDetailBp, tvDetailHr, tvDetailTemp, tvDetailSpo2, tvDetailComplaint;

    public static PatientDetailFragment newInstance(int patientId) {
        PatientDetailFragment fragment = new PatientDetailFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PATIENT_ID, patientId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            patientId = getArguments().getInt(ARG_PATIENT_ID);
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_detail, container, false);

        // Bind Views
        tvDetailName = view.findViewById(R.id.tvDetailName);
        tvDetailMeta = view.findViewById(R.id.tvDetailMeta);
        tvDetailRiskTag = view.findViewById(R.id.tvDetailRiskTag);
        tvDetailBp = view.findViewById(R.id.tvDetailBp);
        tvDetailHr = view.findViewById(R.id.tvDetailHr);
        tvDetailTemp = view.findViewById(R.id.tvDetailTemp);
        tvDetailSpo2 = view.findViewById(R.id.tvDetailSpo2);
        tvDetailComplaint = view.findViewById(R.id.tvDetailComplaint);

        fetchPatientDetails();

        return view;
    }

    private void fetchPatientDetails() {
        // Enqueue Retrofit API call passing 'patientId' parameter variable
        // On response success: update UI elements using populateUI(response.body());
    }

    private void populateUI(PatientDetailFetchResponse data) {
        if (data == null)
            return;
        tvDetailName.setText(data.getFullName());
        tvDetailMeta.setText(data.getAge() + " · " + data.getGender() + " · Arrived " + data.getTimeElapsed());
        tvDetailRiskTag.setText(data.getInitialRisk().toUpperCase());
        tvDetailBp.setText(data.getBp().replace("BP ", ""));
        tvDetailHr.setText(data.getHr() + " bpm");
        tvDetailTemp.setText(data.getTemperature() + "°C");
        tvDetailSpo2.setText(data.getSpo2());
        tvDetailComplaint.setText(data.getChiefComplaint());
    }
}

<?xml version="1.0"encoding="utf-8"?><ScrollView xmlns:android="http://schemas.android.com/apk/res/android"android:layout_width="match_parent"android:layout_height="match_parent"android:fillViewport="true"android:background="#EAF6F8">

<LinearLayout
        android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="vertical">

<RelativeLayout
            android:layout_width="match_parent"android:layout_height="wrap_content"android:background="#0F98B8"android:padding="20dp">

<TextView
                android:id="@+id/tvDetailName"android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Patient Name"android:textStyle="bold"android:textSize="26sp"android:textColor="#FFFFFF"/>

<TextView
                android:id="@+id/tvDetailMeta"android:layout_width="wrap_content"android:layout_height="wrap_content"android:layout_below="@id/tvDetailName"android:text="00y · M · Arrived 0m ago"android:textColor="#DFF7FB"android:textSize="14sp"android:layout_marginTop="4dp"/>

<TextView
                android:id="@+id/tvDetailRiskTag"android:layout_width="wrap_content"android:layout_height="wrap_content"android:layout_alignParentEnd="true"android:layout_centerInParent="true"android:text="RISK --"android:textColor="#F44336"android:background="#FFE5E5"android:paddingHorizontal="10dp"android:paddingVertical="6dp"android:textSize="12sp"android:textStyle="bold"/></RelativeLayout>

<HorizontalScrollView
            android:layout_width="match_parent"android:layout_height="wrap_content"android:scrollbars="none"android:paddingHorizontal="12dp"android:paddingVertical="10dp"android:background="#0F98B8"><LinearLayout
                android:layout_width="wrap_content"android:layout_height="wrap_content"android:orientation="horizontal"><TextView
                    android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Overview"android:textColor="#FFFFFF"android:background="@drawable/chip_active_bg"android:paddingHorizontal="16dp"android:paddingVertical="8dp"android:layout_marginEnd="8dp"/><TextView
                    android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="AI Analysis"android:textColor="#DFF7FB"android:background="@drawable/chip_inactive_bg"android:paddingHorizontal="16dp"android:paddingVertical="8dp"android:layout_marginEnd="8dp"/><TextView
                    android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Risk Score"android:textColor="#DFF7FB"android:background="@drawable/chip_inactive_bg"android:paddingHorizontal="16dp"android:paddingVertical="8dp"/></LinearLayout></HorizontalScrollView>

<LinearLayout
            android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="vertical"android:background="#FFFFFF"android:padding="16dp"android:layout_margin="14dp">

<
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="VITALS"android:textStyle="bold"android:textColor="#90A4AE"android:textSize="12sp"/>

<
GridLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:columnCount="2"android:layout_marginTop="12dp">

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#F8FBFB"android:padding="16dp"android:layout_margin="4dp"android:gravity="center"><
TextView android:id="@+id/tvDetailBp"android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="--/--"android:textSize="22sp"android:textColor="#37474F"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Blood Pressure"android:textColor="#90A4AE"android:textSize="12sp"/></LinearLayout>

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#F8FBFB"android:padding="16dp"android:layout_margin="4dp"android:gravity="center"><
TextView android:id="@+id/tvDetailHr"android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="-- bpm"android:textSize="22sp"android:textColor="#37474F"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Heart Rate"android:textColor="#90A4AE"android:textSize="12sp"/></LinearLayout>

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#F8FBFB"android:padding="16dp"android:layout_margin="4dp"android:gravity="center"><
TextView android:id="@+id/tvDetailTemp"android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="--°C"android:textSize="22sp"android:textColor="#37474F"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Temperature"android:textColor="#90A4AE"android:textSize="12sp"/></LinearLayout>

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#FFF5F5"android:padding="16dp"android:layout_margin="4dp"android:gravity="center"><
TextView android:id="@+id/tvDetailSpo2"android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="--%"android:textSize="22sp"android:textColor="#F44336"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="SpO₂"android:textColor="#E57373"android:textSize="12sp"/></LinearLayout></GridLayout></LinearLayout>

<
LinearLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="vertical"android:background="#FFFFFF"android:padding="16dp"android:layout_marginHorizontal="14dp">

<
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="CHIEF COMPLAINT"android:textStyle="bold"android:textColor="#90A4AE"android:textSize="12sp"/>

<
TextView android:id="@+id/tvDetailComplaint"android:layout_width="match_parent"android:layout_height="wrap_content"android:text="Loading description details..."android:textColor="#37474F"android:textSize="16sp"android:layout_marginTop="12dp"android:lineSpacingMultiplier="1.2"/></LinearLayout>

<
LinearLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="vertical"android:background="#FFFFFF"android:padding="16dp"android:layout_margin="14dp">

<
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="SIMULTANEOUS CLEARANCE"android:textStyle="bold"android:textColor="#90A4AE"android:textSize="12sp"/>

<
GridLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:columnCount="3"android:layout_marginTop="12dp">

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#F0F9FB"android:padding="12dp"android:layout_margin="2dp"android:gravity="center"><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Insurance"android:textColor="#0F98B8"android:textSize="12sp"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Checking..."android:textColor="#546E7A"android:textSize="11sp"android:layout_marginTop="4dp"/></LinearLayout>

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#E8F5E9"android:padding="12dp"android:layout_margin="2dp"android:gravity="center"><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Finance"android:textColor="#4CAF50"android:textSize="12sp"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Cleared"android:textColor="#2E7D32"android:textSize="11sp"android:layout_marginTop="4dp"android:textStyle="bold"/></LinearLayout>

<
LinearLayout android:layout_width="0dp"android:layout_height="wrap_content"android:layout_columnWeight="1"android:orientation="vertical"android:background="#F0F9FB"android:padding="12dp"android:layout_margin="2dp"android:gravity="center"><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Clinical"android:textColor="#0F98B8"android:textSize="12sp"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="Checking..."android:textColor="#546E7A"android:textSize="11sp"android:layout_marginTop="4dp"/></LinearLayout></GridLayout>

<
TextView android:id="@+id/btnRunClearances"android:layout_width="match_parent"android:layout_height="wrap_content"android:text="Run All Clearances Simultaneously"android:textColor="#FFFFFF"android:background="#0F98B8"android:gravity="center"android:padding="14dp"android:textSize="14sp"android:textStyle="bold"android:layout_marginTop="14dp"android:clickable="true"android:focusable="true"/></LinearLayout>

<
LinearLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="vertical"android:background="#FFFFFF"android:padding="16dp"android:layout_marginHorizontal="14dp"android:layout_marginBottom="24dp">

<
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="STATUS"android:textStyle="bold"android:textColor="#90A4AE"android:textSize="12sp"/>

<
LinearLayout android:layout_width="match_parent"android:layout_height="wrap_content"android:orientation="horizontal"android:layout_marginTop="12dp"><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="waiting"android:textColor="#0F98B8"android:background="@drawable/chip_inactive_bg"android:paddingHorizontal="14dp"android:paddingVertical="6dp"android:layout_marginEnd="6dp"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="in progress"android:textColor="#0F98B8"android:background="#E0F7FA"android:paddingHorizontal="14dp"android:paddingVertical="6dp"android:layout_marginEnd="6dp"android:textStyle="bold"/><
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="cleared"android:textColor="#B0BEC5"android:background="@drawable/chip_inactive_bg"android:paddingHorizontal="14dp"android:paddingVertical="6dp"/></LinearLayout>

<
TextView android:layout_width="wrap_content"android:layout_height="wrap_content"android:text="admitted"android:textColor="#B0BEC5"android:background="@drawable/chip_inactive_bg"android:paddingHorizontal="14dp"android:paddingVertical="6dp"android:layout_marginTop="8dp"/></LinearLayout>

<
Space android:layout_width="match_parent"android:layout_height="40dp"/>

</LinearLayout></ScrollView>

package com.saveetha.clearpathai
;

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
import com.saveetha.clearpathai.PatientDetailFetchResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientDetailFragment extends Fragment {

    private static final String ARG_PATIENT_ID = "patient_id";
    private int patientId;

    private TextView tvDetailName, tvDetailMeta, tvDetailRiskTag;
    private TextView tvDetailBp, tvDetailHr, tvDetailTemp, tvDetailSpo2, tvDetailComplaint;

    public static PatientDetailFragment newInstance(int patientId) {
        PatientDetailFragment fragment = new PatientDetailFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PATIENT_ID, patientId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            patientId = getArguments().getInt(ARG_PATIENT_ID);
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_detail, container, false);

        // Bind Views
        tvDetailName = view.findViewById(R.id.tvDetailName);
        tvDetailMeta = view.findViewById(R.id.tvDetailMeta);
        tvDetailRiskTag = view.findViewById(R.id.tvDetailRiskTag);
        tvDetailBp = view.findViewById(R.id.tvDetailBp);
        tvDetailHr = view.findViewById(R.id.tvDetailHr);
        tvDetailTemp = view.findViewById(R.id.tvDetailTemp);
        tvDetailSpo2 = view.findViewById(R.id.tvDetailSpo2);
        tvDetailComplaint = view.findViewById(R.id.tvDetailComplaint);

        // Run dynamic query extraction sequence
        fetchPatientDetails();

        return view;
    }

    private void fetchPatientDetails() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        apiService.getPatientById(patientId).enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call,
                    @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                } else {
                    tvDetailComplaint.setText("Failed to parse patient context summary parameters.");
                    if (getContext() != null) {
                        Toast.makeText(getContext(), "Server error response code: " + response.code(),
                                Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Network Sync Error: ", t);
                tvDetailComplaint.setText("Network error: Could not reach the backend service layer.");
            }
        });
    }

    private void populateUI(PatientDetailFetchResponse data) {
        if (data == null)
            return;

        tvDetailName.setText(data.getFullName());
        tvDetailMeta.setText(data.getAge() + " · " + data.getGender() + " · Arrived " + data.getTimeElapsed());

        // Dynamic Risk Style configurations matching colors from your dashboard
        // specifications
        String risk = data.getInitialRisk() != null ? data.getInitialRisk().toUpperCase() : "LOW";
        tvDetailRiskTag.setText(risk);

        if (risk.contains("STAT")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#F44336"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFE5E5"));
        } else if (risk.contains("HIGH")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#FF9800"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFF3E0"));
        } else {
            tvDetailRiskTag.setTextColor(Color.parseColor("#4CAF50"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#E8F5E9"));
        }

        // Apply vital readings metrics cleanly
        tvDetailBp.setText(data.getBp().replace("BP ", ""));
        tvDetailHr.setText(data.getHr() + " bpm");

        String temp = data.getTemperature();
        tvDetailTemp.setText(temp.contains("°C") ? temp : temp + "°C");

        String o2 = data.getSpo2();
        tvDetailSpo2.setText(o2.contains("%") ? o2 : o2 + "%");

        tvDetailComplaint.setText(data.getChiefComplaint());
    }
}

<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fillViewport="true"
    android:background="#EAF6F8">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <RelativeLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:background="#0F98B8"
            android:padding="20dp">

            <TextView
                android:id="@+id/tvDetailName"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Patient Name"
                android:textStyle="bold"
                android:textSize="26sp"
                android:textColor="#FFFFFF" />

            <TextView
                android:id="@+id/tvDetailMeta"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_below="@id/tvDetailName"
                android:text="00y · M · Arrived 0m ago"
                android:textColor="#DFF7FB"
                android:textSize="14sp"
                android:layout_marginTop="4dp" />

            <TextView
                android:id="@+id/tvDetailRiskTag"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_alignParentEnd="true"
                android:layout_centerInParent="true"
                android:text="RISK --"
                android:textColor="#F44336"
                android:background="#FFE5E5"
                android:paddingHorizontal="10dp"
                android:paddingVertical="6dp"
                android:textSize="12sp"
                android:textStyle="bold" />
        </RelativeLayout>

        <HorizontalScrollView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:scrollbars="none"
            android:paddingHorizontal="12dp"
            android:paddingVertical="10dp"
            android:background="#0F98B8">
            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal">
                <TextView
                    android:id="@+id/tabOverview"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Overview"
                    android:textColor="#FFFFFF"
                    android:background="@drawable/chip_active_bg"
                    android:paddingHorizontal="16dp"
                    android:paddingVertical="8dp"
                    android:layout_marginEnd="8dp"
                    android:clickable="true"
                    android:focusable="true"/>
                <TextView
                    android:id="@+id/tabAiAnalysis"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="AI Analysis"
                    android:textColor="#DFF7FB"
                    android:background="@drawable/chip_inactive_bg"
                    android:paddingHorizontal="16dp"
                    android:paddingVertical="8dp"
                    android:layout_marginEnd="8dp"
                    android:clickable="true"
                    android:focusable="true"/>
                <TextView
                    android:id="@+id/tabRiskScore"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Risk Score"
                    android:textColor="#DFF7FB"
                    android:background="@drawable/chip_inactive_bg"
                    android:paddingHorizontal="16dp"
                    android:paddingVertical="8dp"
                    android:clickable="true"
                    android:focusable="true"/>
            </LinearLayout>
        </HorizontalScrollView>

        <LinearLayout
            android:id="@+id/containerOverview"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:visibility="visible">

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:background="#FFFFFF"
                android:padding="16dp"
                android:layout_margin="14dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="VITALS"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="12sp" />

                <GridLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:columnCount="2"
                    android:layout_marginTop="12dp">

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#F8FBFB"
                        android:padding="16dp"
                        android:layout_margin="4dp"
                        android:gravity="center">
                        <TextView
                            android:id="@+id/tvDetailBp"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="--/--"
                            android:textSize="22sp"
                            android:textColor="#37474F"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Blood Pressure"
                            android:textColor="#90A4AE"
                            android:textSize="12sp" />
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#F8FBFB"
                        android:padding="16dp"
                        android:layout_margin="4dp"
                        android:gravity="center">
                        <TextView
                            android:id="@+id/tvDetailHr"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="-- bpm"
                            android:textSize="22sp"
                            android:textColor="#37474F"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Heart Rate"
                            android:textColor="#90A4AE"
                            android:textSize="12sp" />
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#F8FBFB"
                        android:padding="16dp"
                        android:layout_margin="4dp"
                        android:gravity="center">
                        <TextView
                            android:id="@+id/tvDetailTemp"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="--°C"
                            android:textSize="22sp"
                            android:textColor="#37474F"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Temperature"
                            android:textColor="#90A4AE"
                            android:textSize="12sp" />
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#FFF5F5"
                        android:padding="16dp"
                        android:layout_margin="4dp"
                        android:gravity="center">
                        <TextView
                            android:id="@+id/tvDetailSpo2"
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="--%"
                            android:textSize="22sp"
                            android:textColor="#F44336"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="SpO₂"
                            android:textColor="#E57373"
                            android:textSize="12sp" />
                    </LinearLayout>
                </GridLayout>
            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:background="#FFFFFF"
                android:padding="16dp"
                android:layout_marginHorizontal="14dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="CHIEF COMPLAINT"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="12sp" />

                <TextView
                    android:id="@+id/tvDetailComplaint"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Loading description details..."
                    android:textColor="#37474F"
                    android:textSize="16sp"
                    android:layout_marginTop="12dp"
                    android:lineSpacingMultiplier="1.2"/>
            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:background="#FFFFFF"
                android:padding="16dp"
                android:layout_margin="14dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="SIMULTANEOUS CLEARANCE"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="12sp" />

                <GridLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:columnCount="3"
                    android:layout_marginTop="12dp">

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#F0F9FB"
                        android:padding="12dp"
                        android:layout_margin="2dp"
                        android:gravity="center">
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Insurance"
                            android:textColor="#0F98B8"
                            android:textSize="12sp"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Checking..."
                            android:textColor="#546E7A"
                            android:textSize="11sp"
                            android:layout_marginTop="4dp"/>
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#E8F5E9"
                        android:padding="12dp"
                        android:layout_margin="2dp"
                        android:gravity="center">
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Finance"
                            android:textColor="#4CAF50"
                            android:textSize="12sp"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Cleared"
                            android:textColor="#2E7D32"
                            android:textSize="11sp"
                            android:layout_marginTop="4dp"
                            android:textStyle="bold"/>
                    </LinearLayout>

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_columnWeight="1"
                        android:orientation="vertical"
                        android:background="#F0F9FB"
                        android:padding="12dp"
                        android:layout_margin="2dp"
                        android:gravity="center">
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Clinical"
                            android:textColor="#0F98B8"
                            android:textSize="12sp"
                            android:textStyle="bold"/>
                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="Checking..."
                            android:textColor="#546E7A"
                            android:textSize="11sp"
                            android:layout_marginTop="4dp"/>
                    </LinearLayout>
                </GridLayout>

                <TextView
                    android:id="@+id/btnRunClearances"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Run All Clearances Simultaneously"
                    android:textColor="#FFFFFF"
                    android:background="#0F98B8"
                    android:gravity="center"
                    android:padding="14dp"
                    android:textSize="14sp"
                    android:textStyle="bold"
                    android:layout_marginTop="14dp"
                    android:clickable="true"
                    android:focusable="true"/>
            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:background="#FFFFFF"
                android:padding="16dp"
                android:layout_marginHorizontal="14dp"
                android:layout_marginBottom="24dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="STATUS"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="12sp" />

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:layout_marginTop="12dp">
                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="waiting"
                        android:textColor="#0F98B8"
                        android:background="@drawable/chip_inactive_bg"
                        android:paddingHorizontal="14dp"
                        android:paddingVertical="6dp"
                        android:layout_marginEnd="6dp"/>
                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="in progress"
                        android:textColor="#0F98B8"
                        android:background="#E0F7FA"
                        android:paddingHorizontal="14dp"
                        android:paddingVertical="6dp"
                        android:layout_marginEnd="6dp"
                        android:textStyle="bold"/>
                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="cleared"
                        android:textColor="#B0BEC5"
                        android:background="@drawable/chip_inactive_bg"
                        android:paddingHorizontal="14dp"
                        android:paddingVertical="6dp"/>
                </LinearLayout>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="admitted"
                    android:textColor="#B0BEC5"
                    android:background="@drawable/chip_inactive_bg"
                    android:paddingHorizontal="14dp"
                    android:paddingVertical="6dp"
                    android:layout_marginTop="8dp"/>
            </LinearLayout>
        </LinearLayout>


        <LinearLayout
            android:id="@+id/containerAiAnalysis"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:layout_margin="14dp"
            android:visibility="gone">

            <RelativeLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginBottom="12dp">
                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="⚡ AI ANALYSIS ENGINE"
                    android:textStyle="bold"
                    android:textColor="#0F98B8"
                    android:textSize="12sp" />
                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_alignParentEnd="true"
                    android:text="Complete"
                    android:textColor="#4CAF50"
                    android:background="#E8F5E9"
                    android:paddingHorizontal="8dp"
                    android:paddingVertical="4dp"
                    android:textSize="11sp"
                    android:textStyle="bold"/>
            </RelativeLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:background="#FFFFFF"
                android:padding="16dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="EXTRACTED SYMPTOMS"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="11sp" />

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:layout_marginTop="8dp">
                    <TextView
                        android:id="@+id/tvAiSymptom1"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="Chest pain"
                        android:textColor="#F44336"
                        android:background="#FFE5E5"
                        android:paddingHorizontal="10dp"
                        android:paddingVertical="6dp"
                        android:textSize="12sp"
                        android:layout_marginEnd="6dp"/>
                    <TextView
                        android:id="@+id/tvAiSymptom2"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="Diaphoresis"
                        android:textColor="#F44336"
                        android:background="#FFE5E5"
                        android:paddingHorizontal="10dp"
                        android:paddingVertical="6dp"
                        android:textSize="12sp"
                        android:layout_marginEnd="6dp"/>
                    <TextView
                        android:id="@+id/tvAiSymptom3"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="Dyspnea"
                        android:textColor="#F44336"
                        android:background="#FFE5E5"
                        android:paddingHorizontal="10dp"
                        android:paddingVertical="6dp"
                        android:textSize="12sp"/>
                </LinearLayout>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="AI DIAGNOSIS INSIGHTS"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="11sp"
                    android:layout_marginTop="20dp" />

                <TextView
                    android:id="@+id/tvAiInsight1"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="• ST-elevation pattern detected (V1-V4) — STEMI protocol"
                    android:textColor="#0F98B8"
                    android:background="#F0F9FB"
                    android:padding="12dp"
                    android:layout_marginTop="8dp"
                    android:textSize="13sp"/>

                <TextView
                    android:id="@+id/tvAiInsight2"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="• Troponin I elevated confirms myocardial injury"
                    android:textColor="#0F98B8"
                    android:background="#F0F9FB"
                    android:padding="12dp"
                    android:layout_marginTop="6dp"
                    android:textSize="13sp"/>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="SCAN INTERPRETATION"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="11sp"
                    android:layout_marginTop="20dp" />

                <TextView
                    android:id="@+id/tvAiScanInterpretation"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="ECG: ST elevation V1-V4, STEMI. Immediate cath lab activation recommended."
                    android:textColor="#0F98B8"
                    android:background="#F0F9FB"
                    android:padding="12dp"
                    android:layout_marginTop="8dp"
                    android:textSize="13sp"/>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="BILLING VERIFICATION"
                    android:textStyle="bold"
                    android:textColor="#90A4AE"
                    android:textSize="11sp"
                    android:layout_marginTop="20dp" />

                <TextView
                    android:id="@+id/tvAiBillingVerification"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="85% coverage confirmed. co-pay at admission standard."
                    android:textColor="#2E7D32"
                    android:background="#E8F5E9"
                    android:padding="12dp"
                    android:layout_marginTop="8dp"
                    android:textSize="13sp"
                    android:textStyle="bold"/>
            </LinearLayout>
        </LinearLayout>

        <Space
            android:layout_width="match_parent"
            android:layout_height="40dp"/>

    </LinearLayout>
</ScrollView>

package com.saveetha.clearpathai;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import com.saveetha.clearpathai.PatientDetailFetchResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientDetailFragment extends Fragment implements View.OnClickListener {

    private static final String ARG_PATIENT_ID = "patient_id";
    private int patientId;

    // Outer View Header Components
    private TextView tvDetailName, tvDetailMeta, tvDetailRiskTag;
    private TextView tabOverview, tabAiAnalysis, tabRiskScore;
    private TextView selectedTab;

    // Visibility Content Containers
    private LinearLayout containerOverview, containerAiAnalysis;

    // Overview Components
    private TextView tvDetailBp, tvDetailHr, tvDetailTemp, tvDetailSpo2, tvDetailComplaint;

    // AI Analysis View Field Targets
    private TextView tvAiSymptom1, tvAiSymptom2, tvAiSymptom3;
    private TextView tvAiInsight1, tvAiInsight2, tvAiScanInterpretation, tvAiBillingVerification;

    public static PatientDetailFragment newInstance(int patientId) {
        PatientDetailFragment fragment = new PatientDetailFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PATIENT_ID, patientId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            patientId = getArguments().getInt(ARG_PATIENT_ID);
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_patient_detail, container, false);

        // Bind Base Header and Layout Controllers
        tvDetailName = view.findViewById(R.id.tvDetailName);
        tvDetailMeta = view.findViewById(R.id.tvDetailMeta);
        tvDetailRiskTag = view.findViewById(R.id.tvDetailRiskTag);

        tabOverview = view.findViewById(R.id.tabOverview);
        tabAiAnalysis = view.findViewById(R.id.tabAiAnalysis);
        tabRiskScore = view.findViewById(R.id.tabRiskScore);

        containerOverview = view.findViewById(R.id.containerOverview);
        containerAiAnalysis = view.findViewById(R.id.containerAiAnalysis);

        // Bind Overview Elements
        tvDetailBp = view.findViewById(R.id.tvDetailBp);
        tvDetailHr = view.findViewById(R.id.tvDetailHr);
        tvDetailTemp = view.findViewById(R.id.tvDetailTemp);
        tvDetailSpo2 = view.findViewById(R.id.tvDetailSpo2);
        tvDetailComplaint = view.findViewById(R.id.tvDetailComplaint);

        // Bind AI Analysis Elements
        tvAiSymptom1 = view.findViewById(R.id.tvAiSymptom1);
        tvAiSymptom2 = view.findViewById(R.id.tvAiSymptom2);
        tvAiSymptom3 = view.findViewById(R.id.tvAiSymptom3);
        tvAiInsight1 = view.findViewById(R.id.tvAiInsight1);
        tvAiInsight2 = view.findViewById(R.id.tvAiInsight2);
        tvAiScanInterpretation = view.findViewById(R.id.tvAiScanInterpretation);
        tvAiBillingVerification = view.findViewById(R.id.tvAiBillingVerification);

        // Configure Navigation Click Listeners
        tabOverview.setOnClickListener(this);
        tabAiAnalysis.setOnClickListener(this);
        tabRiskScore.setOnClickListener(this);

        selectedTab = tabOverview; // Default tab state assignment

        // Run dynamic query extraction sequence
        fetchPatientDetails();

        return view;
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();

        // Update selection styling indicators programmatically
        toggleTabHighlight((TextView) v);

        if (id == R.id.tabOverview) {
            containerOverview.setVisibility(View.VISIBLE);
            containerAiAnalysis.setVisibility(View.GONE);
        } else if (id == R.id.tabAiAnalysis) {
            containerOverview.setVisibility(View.GONE);
            containerAiAnalysis.setVisibility(View.VISIBLE);
        }
    }

    private void toggleTabHighlight(TextView activeTab) {
        // Reset last active selection style metrics
        selectedTab.setBackgroundResource(R.drawable.chip_inactive_bg);
        selectedTab.setTextColor(Color.parseColor("#DFF7FB"));

        // Highlight newly tapped active tab field configuration
        activeTab.setBackgroundResource(R.drawable.chip_active_bg);
        activeTab.setTextColor(Color.parseColor("#FFFFFF"));

        selectedTab = activeTab;
    }

    private void fetchPatientDetails() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        apiService.getPatientById(patientId).enqueue(new Callback<PatientDetailFetchResponse>() {
            @Override
            public void onResponse(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Response<PatientDetailFetchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    populateUI(response.body());
                } else {
                    tvDetailComplaint.setText("Failed to parse patient context summary parameters.");
                }
            }

            @Override
            public void onFailure(@NonNull Call<PatientDetailFetchResponse> call, @NonNull Throwable t) {
                Log.e("PatientDetailFragment", "Network Sync Error: ", t);
                tvDetailComplaint.setText("Network error: Could not reach backend.");
            }
        });
    }

    private void populateUI(PatientDetailFetchResponse data) {
        if (data == null) return;

        // Base Core Elements Mapping
        tvDetailName.setText(data.getFullName());
        tvDetailMeta.setText(data.getAge() + " · " + data.getGender() + " · Arrived " + data.getTimeElapsed());

        String risk = data.getInitialRisk() != null ? data.getInitialRisk().toUpperCase() : "LOW";
        tvDetailRiskTag.setText(risk);

        if (risk.contains("STAT")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#F44336"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFE5E5"));
        } else if (risk.contains("HIGH")) {
            tvDetailRiskTag.setTextColor(Color.parseColor("#FF9800"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#FFF3E0"));
        } else {
            tvDetailRiskTag.setTextColor(Color.parseColor("#4CAF50"));
            tvDetailRiskTag.setBackgroundColor(Color.parseColor("#E8F5E9"));
        }

        // Apply Vital Readings Metrics Cleanly
        tvDetailBp.setText(data.getBp().replace("BP ", ""));
        tvDetailHr.setText(data.getHr() + " bpm");

        String temp = data.getTemperature();
        tvDetailTemp.setText(temp.contains("°C") ? temp : temp + "°C");

        String o2 = data.getSpo2();
        tvDetailSpo2.setText(o2.contains("%") ? o2 : o2 + "%");

        tvDetailComplaint.setText(data.getChiefComplaint());

        // Dynamic Mock/Calculated Mappings to handle AI analysis items safely based on patient risk categories
        if (risk.contains("STAT")) {
            tvAiSymptom1.setText("Chest pain (left-sided)");
            tvAiSymptom2.setText("Diaphoresis");
            tvAiSymptom3.setText("Dyspnea");
            tvAiInsight1.setText("• ST-elevation pattern (V1-V4) — STEMI protocol");
            tvAiInsight2.setText("• Troponin I elevated 2.4 ng/mL confirms myocardial injury");
            tvAiScanInterpretation.setText("ECG: ST elevation V1-V4, STEMI. Immediate cath lab activation recommended. No prior imaging available.");
            tvAiBillingVerification.setText("• 85% coverage confirmed. ₹18,000 co-pay at admission. Emergency protocol waiver eligible.");
        } else {
            // General Safe fallback text if navigating into non-emergency profiles
            tvAiSymptom1.setText("Abdominal Pain");
            tvAiSymptom2.setText("Nausea");
            tvAiSymptom3.setText("Tenderness");
            tvAiInsight1.setText("• Localized tenderness noted in lower right quadrant.");
            tvAiInsight2.setText("• White blood cell parameters show mild elevated tracking metrics.");
            tvAiScanInterpretation.setText("Ultrasound requested. Evaluation pending confirmation protocols.");
            tvAiBillingVerification.setText("• Coverage profile active. Checking eligibility rules updates.");
        }
    }
}