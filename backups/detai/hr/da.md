1) forgot password for the employee------>

post : http://192.168.1.75:5000 /api/auth/reset-password


backend response :


 {
    "message": "Password reset successfully"
}



2) Mark attendance

check in 
api: http://192.168.1.75:5000/api/attendance/geo-checkin

in body we have to send : {
  "latitude": 18.5204,
  "longitude": 73.8567,
  "accuracy": 15
}


backend response :

{
    "success": true
}


working hours ;

monday to friday : 8:30 hrs timer 
on saturday : 7 hrs timer

Attendance Panel
Track your work hours & check-in / check-out status

CHECK-IN TIME
12 Feb 2026, 10:00 AM
 Time Remaining (8-Hour 30-Minute shift)
01:34:17


and one button for geo check out


check out

Check out attendance -> post: api/attendance/geo-checkout 


body:

    	 {
            "latitude": 18.5204,
       	 "longitude": 73.8567,
            "accuracy": 15
     	} 


        

backend response :

{
    "message": "Checked Out successful "
}




3) attendance summary


Attendance Summary user side ->get: api/Attendance/my-summary


backend respone: 

{
    "employee": {
        "id": 113,
        "name": "TUSHAR PAWAR",
        "employeeCode": "IA00094"
    },
    "records": [
        {
            "date": "2026-02-12T00:00:00",
            "inTime": "16:54",
            "outTime": null,
            "workingHours": "--",
            "status": "P",
            "correctionStatus": "None",
            "token": "wHFYl9zkWYjlSabErgket8_yLaHd1_0748N0wNtABSC-lETGPAErpPN8L-kTyQvQGM82alCZPvS1mabeG-_LWw"
        }
    ]
}

what should be in attendance sumamry:

Attendance Summary — MADHAV ANGAD MORE (IA00117)

from date , to date --> date filter --> 

data should be display in table format :

Date	Check In	Check Out	Working Hours	Status	Correction

like this :

2-02-2026	10:00	--	--	Not Checked Out	
11-02-2026	09:36	18:09	8h 32m	Present	
10-02-2026	09:54	18:27	8h 32m	Present	
09-02-2026	--	--	--	Absent	
08-02-2026	--	--	--	WO	
07-02-2026	10:09	17:28	7h 18m	Present	
06-02-2026	09:34	18:12	8h 37m	Present	
05-02-2026	09:43	18:16	8h 32m	Present	
04-02-2026	09:49	18:21	8h 31m	Present	
03-02-2026	09:35	18:45	9h 10m	Present	Approved
02-02-2026	09:36	18:40	9h 4m	Present	Approved





----->

attendance correction:



first step is 


Attendance correction request get -> get: http://192.168.1.75:5000/api/Attendance/correction-request?token=wHFYl9zkWYjlSabErgketx7OhbDI03SHrphUZcA6zRapGLqiYXgaMJwCmjbHuhUTIFMKY6SM7YXsohMhFMd-og&employeeId=106




.response

{
    "employee": {
        "id": 106,
        "name": "BHAGYSHREE MORE",
        "employeeCode": "IA00087",
        "role": "Employee"
    },
    "attendance": {
        "date": "2026-02-03T00:00:00",
        "inTime": null,
        "outTime": null,
        "status": "A",
        "correctionRequested": false,
        "correctionStatus": "None"
    },
    "token": "wHFYl9zkWYjlSabErgketx7OhbDI03SHrphUZcA6zRapGLqiYXgaMJwCmjbHuhUTIFMKY6SM7YXsohMhFMd-og"
}


second step:


7.Attendance in correction request  hr side -> get :        api/Attendance/correction-requests          

.Response
 "total": 29,
    "requests": [
        {
            "emp_Code": "IA00088",
            "date": "2026-01-24T00:00:00",
            "correctionRemark": "test",
            "correctionStatus": "Pending",
            "correctionRequestedOn": "2026-01-24T11:08:23.483",
            "correctionProofPath": null
        },
]




8.Attendance in correction request submit  -> post :api/Attendance/correction-request
   


Post this details 

.response

{
    "message": "Correction already requested"
}







#### second step is to hit the post api:










6.Attendance Summary hr side ->get:                      api/Attendance/employee-summary/106
{
    "employee": {
        "id": 106,
        "name": "BHAGYSHREE MORE",
        "employeeCode": "IA00087",
        "role": "Employee"
    },
    "fromDate": "2026-02-01T00:00:00",
    "toDate": "2026-02-12T00:00:00+05:30",
    "records": [
        {
            "date": "2026-02-12T00:00:00",
            "inTime": null,
            "outTime": null,
            "workingHours": "--",
            "status": "A",
            "correctionStatus": "None",
            "token": "wHFYl9zkWYjlSabErgketx7OhbDI03SHrphUZcA6zRYQVZwB0_PaLGHH8Sk5SBda6Ya8lh4p8-pNkPWbTAWS4w"
        },
          ]
}


7.Attendance in correction request  hr side -> get :        api/Attendance/correction-requests          

.Response
 "total": 29,
    "requests": [
        {
            "emp_Code": "IA00088",
            "date": "2026-01-24T00:00:00",
            "correctionRemark": "test",
            "correctionStatus": "Pending",
            "correctionRequestedOn": "2026-01-24T11:08:23.483",
            "correctionProofPath": null
        },
]






when user clicks on the request : ?token=wHFYl9zkWYjlSabErgket4MYGz6nb9ZaQdLl_Tki4e57e3KwKKEURtOtV7tN7VuZUAI1UYM3IJyWw0Hcz7HC4g&employeeId=153

then we have to hit this api ,with this token:


in params we have to send


token:
employeeId: 
9.Attendance correction request get -> get: http://192.168.1.75:5000/api/Attendance/correction-request?token=wHFYl9zkWYjlSabErgketx7OhbDI03SHrphUZcA6zRapGLqiYXgaMJwCmjbHuhUTIFMKY6SM7YXsohMhFMd-og&employeeId=106


backend response:



    "employee": {
        "id": 106,
        "name": "BHAGYSHREE MORE",
        "employeeCode": "IA00087",
        "role": "Employee"
    },
    "attendance": {
        "date": "2026-02-03T00:00:00",
        "inTime": null,
        "outTime": null,
        "status": "A",
        "correctionRequested": false,
        "correctionStatus": "None"
    },
    "token": "wHFYl9zkWYjlSabErgketx7OhbDI03SHrphUZcA6zRapGLqiYXgaMJwCmjbHuhUTIFMKY6SM7YXsohMhFMd-og"
}



after that hit the other api for 



.Attendance in correction request submit  -> post :api/Attendance/correction-request



in body , in form data , we have to 


8.Attendance in correction request submit  -> post :api/Attendance/correction-request

