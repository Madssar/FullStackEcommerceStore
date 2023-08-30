document.addEventListener('DOMContentLoaded',function(){
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit',function(e){
        e.preventDefault();
        const formData = new FormData(loginForm);
        const payload = new URLSearchParams(formData);

        fetch('/login',{
            method: 'post',
            body: payload
        })
        .then((respone) => respone.json())
        .then((data) =>{
            if(data.message){
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
                window.location.href = '/';
            }
        }).catch((err)=>{
            console.log(err);
        })
    })
})