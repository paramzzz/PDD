package com.saveetha.clearpathai;

import com.google.gson.annotations.SerializedName;

public class DashboardStatsResponse {
    @SerializedName("stat_patients")
    private int statPatients;
    
    @SerializedName("pending_approval")
    private int pendingApproval;
    
    @SerializedName("cleared_today")
    private int clearedToday;
    
    @SerializedName("active_cases")
    private int activeCases;

    public int getStatPatients() { return statPatients; }
    public int getPendingApproval() { return pendingApproval; }
    public int getClearedToday() { return clearedToday; }
    public int getActiveCases() { return activeCases; }
}