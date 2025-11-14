let chart;

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
                alert("Coin nicht gefunden oder Zeitraum nicht verfügbar (Demo-API begrenzt)!");
                return;
            }

            const labels = prices.map(p => new Date(p[0]).toLocaleDateString());
            const values = prices.map(p => p[1]);

            if (chart) {
                chart.destroy();
            }

            const ctx = document.getElementById("chart").getContext("2d");
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${coin} Preis (USD)`,
                        data: values,
                        borderWidth: 2,
                        borderColor: "black",
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    return "Preis: $" + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            ticks: {
                                maxTicksLimit: 12,
                                autoSkip: true
                            }
                        }
                    }
                }
            });
        })
        .catch(err => {
            alert("Fehler beim Abrufen!");
            console.error(err);
        });
}
