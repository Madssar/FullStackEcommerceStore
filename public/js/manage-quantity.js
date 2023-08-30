document.addEventListener('DOMContentLoaded', function(){

    const quantityForm = document.querySelectorAll('.manage-quantity');

    quantityForm.forEach(function(quantityForm){
        quantityForm.addEventListener('submit',function(e){
            e.preventDefault();
            const clickedButtonValue = e.submitter.value;

            formData = new FormData(quantityForm);
            formData.append('clickedButton', clickedButtonValue);
            payload = new URLSearchParams(formData);

            fetch('/edit_product_quantity', {
                method: 'POST',
                body: payload
            })
            .then((response)=>response.json())
            .then((data)=>{
                const productId = formData.get('id');

                //getting all the things which need to be updated on frontend
                const productPrice = document.querySelector(`[data-product-id="${productId}"].total-product-price`);
                const rsitem = document.querySelector(`[data-product-id="${productId}"].rs-items`);
                const quantityBox = document.querySelector(`[data-product-id="${productId}"].quantity-box`);
                
                for(let i=0; i<data.cart.length; i++){
                    if(data.cart[i].id == productId){
                        //updating frontend with latest values
                        quantityBox.value = data.cart[i].quantity;
                        if(!data.cart[i].sale_price){
                            productPrice.innerHTML = `$${data.cart[i].price * data.cart[i].quantity}`;
                            rsitem.innerHTML = `${data.cart[i].name} <strong>$${data.cart[i].price * data.cart[i].quantity}</strong>`;
                        }
                        else{
                            productPrice.innerHTML = `$${data.cart[i].sale_price * data.cart[i].quantity}`;
                            rsitem.innerHTML = `${data.cart[i].name} <strong>$${data.cart[i].sale_price * data.cart[i].quantity}</strong>`;
                        }
                    }
                }

                const totalAmount = document.querySelector('.total-amount');
                totalAmount.innerHTML = `$${data.total}`;
                  
            })
            .catch((err)=>{
                console.log(err);
            });
        });
    });
});