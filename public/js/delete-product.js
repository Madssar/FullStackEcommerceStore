document.addEventListener('DOMContentLoaded', function(){
    const delForm = document.querySelectorAll('.delform');
    delForm.forEach(delProduct =>{
        delProduct.addEventListener('submit',function(e){
            e.preventDefault();
            formData = new FormData(delProduct);
            payload = new URLSearchParams(formData);
            
            fetch('/remove_item', {
                method: 'POST',
                body: payload
            })
            .then((response)=>response.json())
            .then((data)=>{
                Swal.fire({
                    toast: true,
                    icon: 'success',
                    title: data.message,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  
                  // Remove the product and update the on the UI
                  const productId = formData.get('id');
                  const productRow = document.querySelector(`[data-product-id="${productId}"]`);
                  const rsItems = document.querySelector(`[data-product-id="${productId}"].rs-items`);
                  const totalAmount = document.querySelector('.total-amount');
                  if (productRow) {
                    productRow.remove();
                    rsItems.remove();
                    totalAmount.innerHTML = `$ ${data.total}`;
                  }
            })
            .catch((err)=>{
                console.log(err);
            });
        });
    });

});