document.addEventListener('DOMContentLoaded',function(){
    const forgotForm = document.getElementById('forget-form');
    forgotForm.addEventListener('submit',function(e){
        e.preventDefault();
        const formData = new FormData(forgotForm);
        const payload = new URLSearchParams(formData);

        fetch('/forgot-pass',{
            method: 'post',
            body: payload
        })
        .then((respone) => respone.json())
        .then((data) =>{
            if(data.success==false){
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: data.message,
                    position: 'center',
                    showConfirmButton: false,
                    timer: 1500,
                  });
            }
            else{
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: data.message,
                    position: 'center',
                    showConfirmButton: false,
                    timer: 1500,
                  });
            }
        }).catch((err)=>{
            console.log(err);
        })
    })
})