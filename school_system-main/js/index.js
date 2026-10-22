var phpurl = "php/controllers/index.php";
var uploadUrl = "php/ac/upload_image.php";
var selectedStudentIdForAvatar = null;

$(document).ready(function () {
    loadStudents();

    function loadStudents() {
        $.get(phpurl, { opt: '1' }, function (res) {
            var response = typeof res === 'string' ? JSON.parse(res) : res;
            var tbody = $('#studentTableBody');
            tbody.empty();
            
            makeToast("Welcome To The Student Management System");

            if (response.status === 'success' && response.data.length > 0) {
                $.each(response.data, function (index, student) {
                    var photoSrc = student.image_url || student.photo || student.image;
                    if (!photoSrc) {
                        photoSrc = 'https://via.placeholder.com/44/e5e7eb/9ca3af?text=User';
                    }

                    var genderText = (student.gender == '1' || student.gender == 'Female') ? 'Female' : 'Male';

                    var row = `
                        <tr>
                            <td>
                                <img src="${photoSrc}" 
                                     class="avatar-circle avatar-clickable shadow-sm" 
                                     data-id="${student.student_id}" 
                                     title="Click to change photo" 
                                     alt="Avatar"
                                     onerror="this.src='https://via.placeholder.com/44/e5e7eb/9ca3af?text=User';">
                            </td>
                            <td>${student.student_id}</td>
                            <td>${student.first_name}</td>
                            <td>${student.last_name}</td>
                            <td>${student.dob}</td>
                            <td>${student.email}</td>
                            <td>${genderText}</td>
                            <td><span class="badge badge-class rounded-pill px-2 py-1">${student.class}</span></td>
                            <td class="text-end">
                            
                            <button type="button" class='btn btn-outline-warning btn-sm btn-edit' 
                            attr-fn='${student.first_name}'
                            attr-ln='${student.last_name}'
                            attr-d='${student.dob}'
                            attr-e = '${student.email}'">
                                <i class="bi bi-pencil-square"></i></button>
                                
                                <button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="${student.student_id}" title="Delete Student">
                                    <i class="bi bi-trash3-fill"></i>
                                </button>
                                
                            </td>
                        </tr>
                    `;
                    tbody.append(row);
                });
            } else {
                tbody.html('<tr><td colspan="9" class="text-center py-4 text-muted">No students found.</td></tr>');
            }
        }, 'json');
    }

    // --- 1. MODAL PHOTO PREVIEW LOGIC ---
    $('#addStudentPhotoInput').on('change', function () {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#addStudentPhotoPreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 2. ADD STUDENT FORM SUBMIT ---
    $('#formAddStudent').on('submit', function (e) {
        e.preventDefault();

        var photoInput = $('#addStudentPhotoInput')[0];
        
        // If photo selected, upload image first to get path
        if (photoInput.files && photoInput.files[0]) {
            var imageFormData = new FormData();
            imageFormData.append('image', photoInput.files[0]);

            $.ajax({
                url: uploadUrl,
                type: 'POST',
                data: imageFormData,
                contentType: false,
                processData: false,
                success: function (uploadRes) {
                    var res = typeof uploadRes === 'string' ? JSON.parse(uploadRes) : uploadRes;
                    var imageUrl = (res.status === 'success' && res.image_url) ? res.image_url : '';
                    submitStudentData(imageUrl);
                },
                error: function () {
                    // Fallback to submit without photo if upload fails
                    submitStudentData('');
                }
            });
        } else {
            submitStudentData('');
        }
    });

    function submitStudentData(imageUrl) {
        var formData = {
            opt: '2',
            first_name: $('#firstName').val(),
            last_name: $('#lastName').val(),
            dob: $('#dob').val(),
            email: $('#email').val(),
            class: $('#classInput').val(),
            gender: $('#gender').val(),
            image_url: $('#imageUrl').val()
        };

        $.post(phpurl, formData, function (res) {
            var response = typeof res === 'string' ? JSON.parse(res) : res;

            if (response.status === 'success') {
                makeToastGreen("Student successfully inserted");
                $('#formAddStudent')[0].reset();
                $('#addStudentPhotoPreview').attr('src', 'https://via.placeholder.com/86/e5e7eb/9ca3af?text=Photo');
                
                var modal = bootstrap.Modal.getInstance(document.getElementById('modalAddStudent'));
                if (modal) modal.hide();

                loadStudents();
            } else {
                alert(response.message);
            }
        }, 'json');
    }

    // --- 3. CLICK ON TABLE CIRCLE AVATAR TO CHANGE PHOTO DIRECTLY ---
    $(document).on('click', '.avatar-clickable', function () {
        selectedStudentIdForAvatar = $(this).data('id');$('#directAvatarInput').val(''); // Clear old value
        $('#directAvatarInput').click();  // Trigger hidden file input
    });

    $('#directAvatarInput').on('change', function () {
        var file = this.files[0];
        if (!file || !selectedStudentIdForAvatar) return;

        var formData = new FormData();
        formData.append('image', file);
        formData.append('student_id', selectedStudentIdForAvatar);

        $.ajax({
            url: uploadUrl,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (res) {
                var response = typeof res === 'string' ? JSON.parse(res) : res;
                if (response.status === 'success') {
                    makeToastGreen("Student photo updated successfully!");
                    loadStudents(); // Reload table with new avatar
                } else {
                    alert(response.message || "Failed to upload photo");
                }
            },
            error: function () {
                alert("Error uploading photo to server");
            }
        });
    });

    // --- 4. DELETE STUDENT ---
    $(document).on('click', '.btn-delete', function () {
        var studentId = $(this).data('id');

        if (confirm("Are you sure you want to delete this student?")) {
            $.post(phpurl, { opt: '3', id: studentId }, function (res) {
                var response = typeof res === 'string' ? JSON.parse(res) : res;

                if (response.status === 'success') {
                    makeToastRed("Student Successfully Deleted");
                    loadStudents();
                } else {
                    alert(response.message);
                }
            }, 'json');
        }
    });
    
    //EDIT STUDENTS
    $(document).on('click', '.btn-edit', function () {
        $("#modalEditStudent").modal("show");
        
        //Extract the embedded date/hard coded data
        let fn = $(this).attr("attr-fn");
        $("#editFirstName").val(fn);
        
        let ln = $(this).attr("attr-ln");
        $("#editLastName").val(ln);
        
         let d = $(this).attr("attr-d");
        $("#editDob").val(d);
        
         let e = $(this).attr("attr-e");
        $("#editEmail").val(e);
        
        
    })
    
    

    $('#btnRefresh').on('click', function () {
        loadStudents();
    });
});

function makeToast(text = "Hello ma Nigga"){
    $.swipeToast({
        message: text,
        type: 'info',
        duration: 6000,
        position: 'top-center'
    });
}

function makeToastGreen(text = "Hello ta Nigga"){
    $.swipeToast({
        message: text,
        type: 'success',
        duration: 6000,
        position: 'top-center'
    });
}

function makeToastRed(text = "Hello mr Nigga"){
    $.swipeToast({
        message: text,
        type: 'warning',
        duration: 6000,
        position: 'top-center'
    });
}