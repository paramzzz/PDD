package com.saveetha.clearpathai;


import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.saveetha.clearpathai.R;
import com.saveetha.clearpathai.ApiClient;
import com.saveetha.clearpathai.ApiService;
import com.saveetha.clearpathai.NewPatientRequest;
import com.saveetha.clearpathai.NewPatientSubmitResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NewPatientFragment extends Fragment {

    EditText etName, etAge, etComplaint,
            etBp, etHr, etTemp,
            etSpo2, etInsurance, etPolicy, spGender;


    Button btnSubmit;

    public NewPatientFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater,
                             ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(
                R.layout.fragment_new_patient,
                container,
                false
        );

        etName = view.findViewById(R.id.etName);
        etAge = view.findViewById(R.id.etAge);
        etComplaint = view.findViewById(R.id.etComplaint);
        etBp = view.findViewById(R.id.etBp);
        etHr = view.findViewById(R.id.etHr);
        etTemp = view.findViewById(R.id.etTemp);
        etSpo2 = view.findViewById(R.id.etSpo2);
        etInsurance = view.findViewById(R.id.etInsurance);
        etPolicy = view.findViewById(R.id.etPolicy);

        spGender = view.findViewById(R.id.etGender);
        btnSubmit = view.findViewById(R.id.btnSubmit);

        String[] gender = {"Male", "Female", "Other"};

        ArrayAdapter<String> adapter =
                new ArrayAdapter<>(
                        requireContext(),
                        android.R.layout.simple_spinner_dropdown_item,
                        gender
                );


        btnSubmit.setOnClickListener(v -> submitPatient());

        return view;
    }

    private void submitPatient() {

        NewPatientRequest request =
                new NewPatientRequest(

                        etName.getText().toString(),
                        etAge.getText().toString(),
                        spGender.getText().toString(),
                        etComplaint.getText().toString(),
                        etBp.getText().toString(),
                        etHr.getText().toString(),
                        etTemp.getText().toString(),
                        etSpo2.getText().toString(),
                        etInsurance.getText().toString(),
                        etPolicy.getText().toString()
                );

        ApiService apiService =
                ApiClient
                        .getClient()
                        .create(ApiService.class);

        Call<NewPatientSubmitResponse> call =
                apiService.submitPatient(request);

        call.enqueue(new Callback<NewPatientSubmitResponse>() {

            @Override
            public void onResponse(
                    Call<NewPatientSubmitResponse> call,
                    Response<NewPatientSubmitResponse> response) {

                if(response.isSuccessful()
                        && response.body() != null) {

                    Toast.makeText(
                            requireContext(),
                            response.body().getMessage(),
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }

            @Override
            public void onFailure(
                    Call<NewPatientSubmitResponse> call,
                    Throwable t) {

                Toast.makeText(
                        requireContext(),
                        t.getMessage(),
                        Toast.LENGTH_LONG
                ).show();
            }
        });
    }
}