
function aggiungiElemento(){
    const input=document.getElementById("todo-input");
    const lista=document.getElementById("lista-task");
    let testo=input.value;
    if(testo==="") return;
    let li=document.createElement("li");
    li.innerHTML=`
        <span>${testo}</span>
        <span class="delete-btn" onclick="this.parentElement.remove()">X</span>
    `;
    lista.appendChild(li);
    input.value="";
}