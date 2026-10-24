function carregarCandidatos() {
    const dados = localStorage.getItem("candidatos");
    return dados ? JSON.parse(dados) : [];
}

function salvarCandidatos(candidatos) {
    localStorage.setItem("candidatos", JSON.stringify(candidatos));
}

function carregarVotos() {
    const dados = localStorage.getItem("votos");
    return dados ? JSON.parse(dados) : {};

}

function salvarVotos(votos) {
    localStorage.setItem("votos", JSON.stringify(votos));
}



// let senha_passe_criptografada = CryptoJS.SHA512("admin").toString();

//  listaUser.push(
//     {
//       userCad: usuario_pass,
//       senhaCad: senha_passe_criptografada // armazena a senha criptografada 
//     });


// ---- Navegação entre páginas

const abas = document.querySelectorAll(".aba")
const telas = document.querySelectorAll(".tela")
const fim = document.querySelector(".fim")
const confirma = document.querySelectorAll(".confirma")
const btn_voltar = document.querySelector(".btn_voltar")
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
let usuario_pass = "admin";
let senha_passe_criptografada = CryptoJS.SHA512("admin").toString();
let bug = 0;


abas.forEach(function (aba) {
    aba.addEventListener("click", function () {
        abas.forEach(a => a.classList.remove("ativa"));
        telas.forEach(t => t.classList.remove("ativa"));

        aba.classList.add("ativa")
        document.getElementById(aba.dataset.tela).classList.add("ativa")

        if (aba.dataset.tela == "candidatos" && bug != 1){
            fim.classList.remove("ativa");
            btn_voltar.classList.remove("ativa");
            telas.forEach(t => t.classList.remove("ativa"))
            document.getElementById("login_cadastro").classList.add("ativa")};
            
        if (aba.dataset.tela == "btn_entrar"){ 
            
            let senha_usuario_criptografada = CryptoJS.SHA512(senha.value).toString();
            localStorage.setItem("senhado usuario",senha_usuario_criptografada);

            if (usuario.value == usuario_pass && senha_usuario_criptografada == senha_passe_criptografada){
                document.getElementById("candidatos").classList.add("ativa");
                bug = 1;
                mostrarCandidatos()}
            else{
                console.log("erro")}}
        if (aba.dataset.tela == "resultado"){
            fim.classList.remove("ativa");
            btn_voltar.classList.remove("ativa");
            mostrarResultado();
        } 
    });
});







// --- Cadastro de candidatos 
const formaCandidato = document.getElementById("formCandidato");
const listaCandidatos = document.getElementById("listaCandidatos");

formCandidato.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nomeCandidato").value.trim();
    const numero = document.getElementById("numeroCandidato").value.trim();

    const candidatos = carregarCandidatos();

    const existente = candidatos.find(c => c.numero === numero);
    if (existente) {
        alert("Já existe um candidato com o número" + numero);
        return;
    }

    candidatos.push({nome: nome, numero: numero});
    salvarCandidatos(candidatos);

    formCandidato.reset();
    mostrarCandidatos();
});

function mostrarCandidatos() {
    const candidatos = carregarCandidatos();
    listaCandidatos.innerHTML = "";

    if (candidatos.length === 0) {
        listaCandidatos.innerHTML = "<li>Nenhum candidato cadastrado ainda.</li>";
        return;
    }

    candidatos.forEach(function (candidato) {
        const li = document.createElement("li");
        li.innerHTML = `
        <span><strong>${candidato.numero}</strong>-${candidato.nome}</span>

        
        <button onClick="removerCandidato('${candidato.numero}')" id="remover_candidato">Remover</button>`;
        listaCandidatos.appendChild(li);
    });
}

function removerCandidato(numero) {
    const candidatos = carregarCandidatos().filter(c => c.numero !== numero);
    salvarCandidatos(candidatos);
    mostrarCandidatos();
}








// ---- Votação

const inputVoto = document.getElementById("numerovoto");
const previa = document.getElementById("previa");
const urna = document.querySelector(".urna");

inputVoto.addEventListener("input", function () { 
    inputVoto.value = inputVoto.value.replace(/\D/g, "");
    atualizarPrevia();
});

function atualizarPrevia() {
    const numero = inputVoto.value;

    if(numero.length < 2) {
        previa.innerHTML = "";
        return;
    }

    const candidato = carregarCandidatos().find(c => c.numero === numero);

    if(candidato) {
        previa.innerHTML = `Candidato: <strong>${candidato.nome}</strong>`;
       } else {
        previa.innerHTML = `<span class="nulo">Número Errado - Voto Nulo</span>`;
       } 
    }

    function registrarVoto(chave) {
        const votos = carregarVotos();
        votos[chave] = (votos[chave] || 0) + 1;
        salvarVotos(votos);
        
    }

    document.getElementById("btnConfirma").addEventListener("click", function () {
        const numero = inputVoto.value;


        if(numero.length < 2) {
            alert("Digite o número do candidato (2 dígitos).");
            return;
        }
        
        const candidato = carregarCandidatos().find(c => c.numero === numero);
        registrarVoto(candidato ? numero : "nulo");
        limpaUrna();
        votacao.classList.remove("ativa");
        document.getElementById("fim").classList.add("ativa");
        document.getElementById("btn_voltar").classList.add("ativa");
        mostrarFim()})






    document.getElementById("btn_voltar").addEventListener("click", function () {
        fim.classList.remove("ativa");
        btn_voltar.classList.remove("ativa");
        document.getElementById("votacao").classList.add("ativa");
        limpaUrna();
    })
    

    document.getElementById("btnBranco").addEventListener("click", function() {
        registrarVoto("branco");
        mostrarFim()
    });

    document.getElementById("btnCorrige").addEventListener("click", limpaUrna);

    function limpaUrna() {
        inputVoto.value = "";
        previa.innerHTML = "";
        inputVoto.focus();
    }


// ----- Resultado
function mostrarResultado() {
    const candidatos = carregarCandidatos();
    const votos = carregarVotos();
    const lista = document.getElementById("listaResultado");

    const resultado = candidatos.map(c => ({
        nome: `${c.numero} - ${c.nome}`,
        qtd: votos[c.numero] || 0 }));
    resultado.push({nome: "Brancos", qtd: votos.branco || 0});
    resultado.push({nome: "Nulos", qtd: votos.nulo || 0});

    resultado.sort((a, b) => b.qtd - a.qtd);

    const total = resultado.reduce((soma, item) => soma + item.qtd, 0);
    document.getElementById("totalVotos").textContent = `Total de votos: ${total}`;

    lista.innerHTML = "";
    resultado.forEach(function (item) {
        const porcentagem = total > 0 ? ((item.qtd / total) * 100).toFixed(1) : 0;
        lista.innerHTML += `
        <div class="item-resultado">
            <div class="linha">
                <span>${item.nome}</span>
                <span>${item.qtd} voto(s) - ${porcentagem}%</span>
            </div>
            <div class="barra"><div style="width: ${porcentagem}%"></div></div>
        </div>`;
    });
}

document.getElementById("btnZerar").addEventListener("click", function () {
    if (confirm("Tem certeza que deseja apagar TODOS os votos?")) {
        localStorage.removeItem("votos");
        mostrarResultado();
    }
});

inputVoto.focus();









