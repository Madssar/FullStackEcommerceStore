function checkout(){
    fetch('/place-order',{
        method:'Post',
    })
    .then((response)=>response.json())
    .then((data)=>{
        if(data.message){
            Swal.fire({
                toast: true,
                icon: 'success',
                title: data.message,
                position: 'center',
                showConfirmButton: false,
                timer: 1500,
            });
        }
        else{
            window.location.href="/login";
        }
    })
    .catch((error)=>{
        console.log(error);
    })               
}
