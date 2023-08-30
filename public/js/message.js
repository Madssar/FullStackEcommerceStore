document.addEventListener('DOMContentLoaded', function(){
    const messageForm = document.getElementById('message-form');
    messageForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        formData = new FormData(messageForm);
        payload = new URLSearchParams(formData);

        fetch('/message',{
            method: 'post',
            body: payload
        })
        .then((response)=>response.json())
        .then((data)=>{
            Swal.fire({
                toast: true,
                icon: 'success',
                title: data.message,
                position: 'center',
                showConfirmButton: false,
                timer: 1500,
              });
            document.getElementById('s-name').value = '';
            document.getElementById('s-email').value = '';
            document.getElementById('s-message').value = '';
        }).catch((err)=>{
            console.log(err);
        })
    })
})