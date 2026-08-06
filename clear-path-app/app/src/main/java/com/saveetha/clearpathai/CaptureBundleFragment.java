package com.saveetha.clearpathai;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CaptureBundleFragment extends Fragment {

    private static final String ARG_PATIENT_ID = "patient_id";
    private static final String ARG_DOC_TYPE = "doc_type";

    private int patientId;
    private String documentType;

    private TextView tvCaptureSubHeader, tvFileStatus;
    private Button btnScanCamera, btnUploadGallery, btnSubmitUpload;

    // Byte tracking references to store intent streaming artifacts before submission
    private byte[] selectedFileBytes = null;
    private String selectedFileName = "";

    // Modern Intent Callback Registration Launchers
    private ActivityResultLauncher<Void> cameraLauncher;
    private ActivityResultLauncher<String> galleryLauncher;

    public static CaptureBundleFragment newInstance(int patientId, String docType) {
        CaptureBundleFragment fragment = new CaptureBundleFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_PATIENT_ID, patientId);
        args.putString(ARG_DOC_TYPE, docType);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            patientId = getArguments().getInt(ARG_PATIENT_ID);
            documentType = getArguments().getString(ARG_DOC_TYPE);
        }

        // Initialize Native Camera Launcher Callback
        cameraLauncher = registerForActivityResult(new ActivityResultContracts.TakePicturePreview(), responseBitmap -> {
            if (responseBitmap != null) {
                ByteArrayOutputStream stream = new ByteArrayOutputStream();
                responseBitmap.compress(Bitmap.CompressFormat.JPEG, 90, stream);
                selectedFileBytes = stream.toByteArray();
                selectedFileName = "camera_capture_" + System.currentTimeMillis() + ".jpg";

                tvFileStatus.setText("✓ Camera photo ready: " + selectedFileName);
                tvFileStatus.setTextColor(0xFF2ECC71); // Green color code metric
                btnSubmitUpload.setEnabled(true);
            }
        });

        // Initialize Native File Picker Gallery Launcher Callback
        galleryLauncher = registerForActivityResult(new ActivityResultContracts.GetContent(), fileUri -> {
            if (fileUri != null && getContext() != null) {
                try {
                    selectedFileName = getFileNameFromUri(getContext(), fileUri);
                    InputStream inputStream = getContext().getContentResolver().openInputStream(fileUri);
                    if (inputStream != null) {
                        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = inputStream.read(buffer)) != -1) {
                            byteBuffer.write(buffer, 0, len);
                        }
                        selectedFileBytes = byteBuffer.toByteArray();

                        tvFileStatus.setText("✓ File selected: " + selectedFileName);
                        tvFileStatus.setTextColor(0xFF2ECC71);
                        btnSubmitUpload.setEnabled(true);
                    }
                } catch (Exception e) {
                    Log.e("CaptureBundle", "Error reading stream parameters", e);
                    Toast.makeText(getContext(), "Failed to read chosen file reference.", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_capture_bundle, container, false);

        tvCaptureSubHeader = view.findViewById(R.id.tvCaptureSubHeader);
        tvFileStatus = view.findViewById(R.id.tvFileStatus);
        btnScanCamera = view.findViewById(R.id.btnScanCamera);
        btnUploadGallery = view.findViewById(R.id.btnUploadGallery);
        btnSubmitUpload = view.findViewById(R.id.btnSubmitUpload);

        if (documentType != null) {
            tvCaptureSubHeader.setText("Target Document Category: " + documentType);
        }

        // Click Bindings to trigger modern launchers
        btnScanCamera.setOnClickListener(v -> cameraLauncher.launch(null));
        btnUploadGallery.setOnClickListener(v -> galleryLauncher.launch("image/*"));
        btnSubmitUpload.setOnClickListener(v -> processServerUploadRequest());

        return view;
    }

    private void processServerUploadRequest() {
        if (selectedFileBytes == null) return;

        btnSubmitUpload.setEnabled(false);
        btnSubmitUpload.setText("Uploading file reference...");

        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        // Convert primitives into Multipart Request parts
        RequestBody patientIdPart = RequestBody.create(MediaType.parse("text/plain"), String.valueOf(patientId));
        RequestBody docTypePart = RequestBody.create(MediaType.parse("text/plain"), documentType);

        // Turn our bytes into real MultiPart segments
        RequestBody fileBody = RequestBody.create(MediaType.parse("image/jpeg"), selectedFileBytes);
        MultipartBody.Part filePart = MultipartBody.Part.createFormData("file", selectedFileName, fileBody);

        apiService.uploadPatientDocument(patientIdPart, docTypePart, filePart).enqueue(new Callback<DocumentUploadResponse>() {
            @Override
            public void onResponse(@NonNull Call<DocumentUploadResponse> call, @NonNull Response<DocumentUploadResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (getContext() != null) {
                        Toast.makeText(getContext(), response.body().getMessage(), Toast.LENGTH_LONG).show();
                    }
                    // Return safely to patient queue view
                    if (getParentFragmentManager() != null) {
                        getParentFragmentManager().popBackStack(null, androidx.fragment.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
                    }
                } else {
                    resetSubmitButtonState();
                    Toast.makeText(getContext(), "Server error writing attachment to database.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<DocumentUploadResponse> call, @NonNull Throwable t) {
                resetSubmitButtonState();
                Log.e("CaptureBundleFragment", "Network stream upload trace error: ", t);
                Toast.makeText(getContext(), "Network link error. Upload dropped.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void resetSubmitButtonState() {
        btnSubmitUpload.setEnabled(true);
        btnSubmitUpload.setText("Upload Document");
    }

    // Helper utility method to read file metadata directly out of a content URI query provider
    private String getFileNameFromUri(Context context, Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            try (Cursor cursor = context.getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex != -1) result = cursor.getString(nameIndex);
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) result = result.substring(cut + 1);
        }
        return result;
    }
}