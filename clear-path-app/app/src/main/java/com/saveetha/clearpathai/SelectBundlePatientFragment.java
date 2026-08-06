package com.saveetha.clearpathai;

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

public class SelectBundlePatientFragment extends Fragment {

    private static final String ARG_DOC_TYPE = "doc_type";
    private String selectedDocType;

    private RecyclerView rvBundlePatients;
    private BundlePatientAdapter adapter;
    private TextView tvBundleSubHeader;

    public static SelectBundlePatientFragment newInstance(String docType) {
        SelectBundlePatientFragment fragment = new SelectBundlePatientFragment();
        Bundle args = new Bundle();
        args.putString(ARG_DOC_TYPE, docType);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            selectedDocType = getArguments().getString(ARG_DOC_TYPE);
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_select_bundle_patient, container, false);

        tvBundleSubHeader = view.findViewById(R.id.tvBundleSubHeader);
        if (selectedDocType != null) {
            tvBundleSubHeader.setText("Processing Bundle: " + selectedDocType);
        }

        rvBundlePatients = view.findViewById(R.id.rvBundlePatients);
        rvBundlePatients.setLayoutManager(new LinearLayoutManager(getContext()));

        // REPLACE YOUR STEP 2 ADAPTER CLICK INITIALIZATION CONTEXT WITH THIS BLOCK:
        adapter = new BundlePatientAdapter(new ArrayList<>(), patient -> {
            // Launch Step 3 passing selected variables downstream cleanly
            CaptureBundleFragment captureFragment = CaptureBundleFragment.newInstance(patient.getId(), selectedDocType);

            if (getParentFragmentManager() != null) {
                getParentFragmentManager().beginTransaction()
                        .replace(R.id.frameLayout, captureFragment) // R.id.fragment_container must match your MainActivity layout
                        .addToBackStack(null)
                        .commit();
            }
        });
        rvBundlePatients.setAdapter(adapter);

        fetchPatientsFromBackend();
        return view;
    }

    private void fetchPatientsFromBackend() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.getActivePatients().enqueue(new Callback<List<PatientDetailFetchResponse>>() {
            @Override
            public void onResponse(@NonNull Call<List<PatientDetailFetchResponse>> call, @NonNull Response<List<PatientDetailFetchResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateData(response.body());
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<PatientDetailFetchResponse>> call, @NonNull Throwable t) {
                Log.e("SelectBundlePatient", "API error link failure: ", t);
            }
        });
    }
}