async function pay() {
  const phone = document.getElementById("phone").value;

  const res = await fetch("http://localhost:5000/api/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone })
  });

  const data = await res.json();

  if (data.authorization_url) {
    window.location.href = data.authorization_url;
  } else {
    alert("Erreur paiement");
  }
}