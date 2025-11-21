let chart;

function ladeTabelle() {
    const eingabe = document.getElementById("coinInput").value.toLowerCase();
    const apiKey = "";

    let url = "";

    if (eingabe === "") {
        url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&x_cg_demo_api_key=${apiKey}`;
    } else {
        url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${eingabe}&x_cg_demo_api_key=${apiKey}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const tableBody = document.querySelector("#cryptoTable tbody");
            tableBody.innerHTML = "";

            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='4'>Coin nicht gefunden</td></tr>";
                return;
            }

            data.forEach(coin => {
                const row = document.createElement("tr");

                const change24 = coin.price_change_percentage_24h;
                const changeClass = change24 >= 0 ? "positive" : "negative";

                row.innerHTML = `
                    <td><img src="${coin.image}" width="20"> ${coin.name}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td>$${coin.market_cap.toLocaleString()}</td>
                    <td class="${changeClass}">${change24.toFixed(2)}%</td>
                `;

                row.onclick = () => {
                    document.getElementById("coinInput").value = coin.id;
                    ladeDiagramm(365);
                    ladeTabelle();
                    window.scrollTo({ top: 600, behavior: "smooth" });
                };

                tableBody.appendChild(row);
            });
        });
}

function ladeDiagramm(days) {
    const coin = document.getElementById("coinInput").value.toLowerCase();
    const apiKey = "CG-PBmQN1c2yQRaG3hS7VwDMnX2";

    if (!coin) {
        alert("Bitte einen Coin eingeben!");
        return;
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}&x_cg_demo_api_key=${apiKey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const prices = data.prices;
            if (!prices) {
                alert("Coin nicht gefunden!");
                return;
            }

            const labels = prices.map(p => new Date(p[0]).toLocaleDateString());
            const values = prices.map(p => p[1]);

            if (chart) chart.destroy();

            const ctx = document.getElementById("chart").getContext("2d");
            chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${coin} Preis (USD)`,
                        data: values,
                        borderColor: "black",
                        borderWidth: 2,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: p => "Preis: $" + p.parsed.y.toLocaleString()
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { maxTicksLimit: 12, autoSkip: true }
                        }
                    }
                }
            });
        });
}

window.onload = function() {
    ladeTabelle();
};



function eingabeGeändert() {
    const wert = document.getElementById("coinInput").value.trim();

    if (wert === "") {
        ladeTabelle(); // wenn leer → alle Coins anzeigen
    }
}
