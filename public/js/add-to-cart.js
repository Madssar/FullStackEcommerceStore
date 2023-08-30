document.addEventListener("DOMContentLoaded", function() {
  const cartForms = document.querySelectorAll(".cart-form");
  cartForms.forEach(cartForm => {
      cartForm.addEventListener("submit", function(event) {
          event.preventDefault();
          const formData = new FormData(cartForm);
          const payload = new URLSearchParams(formData);

          fetch('/add_to_cart', {
              method: 'POST',
              body: payload,
          })
          .then((response) => response.json())
          .then((data) => {
            if(data.message){
              Swal.fire({
                toast: true,
                icon: 'success',
                title: data.message,
                position: 'top-right',
                showConfirmButton: false,
                timer: 1500,
              });
          }
          else{
            Swal.fire({
              toast: true,
              icon: 'error',
              title: 'Failed to add product',
              position: 'top-right',
              showConfirmButton: false,
              timer: 1500,
            });
          }
          })
          .catch((error) => {
              console.error('Error:', error);
          });
      });
  });
});
