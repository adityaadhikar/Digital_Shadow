document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scanForm');
    const inputSection = document.querySelector('.input-section');
    const scanningSection = document.getElementById('scanningSection');
    const resultsDashboard = document.getElementById('resultsDashboard');
    const scanSteps = document.getElementById('scanSteps');
    const progressBar = document.getElementById('progressBar');
    
    // Results DOM Elements
    const scoreValue = document.getElementById('scoreValue');
    const threatLevel = document.getElementById('threatLevel');
    const gauge = document.querySelector('.gauge');
    const breachesList = document.getElementById('breachesList');
    const recommendationsList = document.getElementById('recommendationsList');
    const accountsList = document.getElementById('accountsList');

    const scanPhases = [
        "Initiating external network trace protocol...",
        "Querying global breach databases...",
        "Scanning open source repositories for artifacts...",
        "Analyzing avatar and identity footprints...",
        "Compiling relationship entity graph...",
        "Calculating combined risk exposure metric..."
    ];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const demoMode = document.getElementById('demoMode').checked;

        // Transition UI to Scanning
        inputSection.classList.add('hidden');
        scanningSection.classList.remove('hidden');
        resultsDashboard.classList.add('hidden');
        
        scanSteps.innerHTML = '';
        progressBar.style.width = '0%';
        
        let currentPhase = 0;
        
        // Setup visual terminal simulation
        const phaseInterval = setInterval(() => {
            if (currentPhase < scanPhases.length) {
                const li = document.createElement('li');
                li.textContent = `[+] ${scanPhases[currentPhase]}`;
                scanSteps.appendChild(li);
                
                // Keep terminal scrolled to bottom
                scanSteps.parentElement.scrollTop = scanSteps.parentElement.scrollHeight;

                progressBar.style.width = `${((currentPhase + 1) / scanPhases.length) * 100}%`;
                currentPhase++;
            }
        }, 900); // Wait between fake logs to build suspense

        try {
            // Kick off the actual API request
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, demo_mode: demoMode })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
            }

            const data = await response.json();
            
            // Artificial delay to ensure animation looks cool before displaying results
            const remainingAnimationTime = Math.max(0, (scanPhases.length - currentPhase) * 900 + 500);
            
            setTimeout(() => {
                clearInterval(phaseInterval);
                // Force completion of animation explicitly if it was skipped
                while (currentPhase < scanPhases.length) {
                    const li = document.createElement('li');
                    li.textContent = `[+] ${scanPhases[currentPhase]}`;
                    scanSteps.appendChild(li);
                    currentPhase++;
                }
                progressBar.style.width = '100%';
                
                // Show results after brief pause
                setTimeout(() => {
                    displayResults(data);
                }, 800);
                
            }, remainingAnimationTime);

        } catch (error) {
            clearInterval(phaseInterval);
            const li = document.createElement('li');
            li.textContent = `[-] ERROR: Connection to mainframe failed or invalid parameters.`;
            li.style.color = 'var(--danger-color)';
            scanSteps.appendChild(li);
            console.error('Scan Error:', error);
            
            setTimeout(() => {
                alert("An error occurred during scanning. Attempting to reset form...");
                location.reload();
            }, 3000);
        }
    });

    function displayResults(data) {
        scanningSection.classList.add('hidden');
        resultsDashboard.classList.remove('hidden');

        const assessment = data.risk_assessment;
        
        // 1. Update Score & Gauge Animation
        // Animate counting up to score
        let count = 0;
        const targetScore = assessment.score;
        const countInterval = setInterval(() => {
            if (count >= targetScore) {
                scoreValue.textContent = targetScore;
                clearInterval(countInterval);
            } else {
                count += Math.ceil((targetScore - count) / 5) || 1;
                scoreValue.textContent = count;
            }
        }, 50);
        

        let gaugeColor = 'var(--primary-color)';
        
        threatLevel.textContent = assessment.threat_level + " RISK";
        threatLevel.className = "threat-level"; // reset classes
        
        if (targetScore >= 70) {
            gaugeColor = 'var(--danger-color)';
            threatLevel.classList.add('threat-high');
        } else if (targetScore >= 30) {
            gaugeColor = 'var(--warning-color)';
            threatLevel.classList.add('threat-medium');
        } else {
            threatLevel.classList.add('threat-low');
        }

        // Delay gradient applying for smooth effect
        setTimeout(() => {
            gauge.style.background = `conic-gradient(${gaugeColor} ${targetScore}%, #222 ${targetScore}%)`;
        }, 300);

        // 2. Render Breaches
        breachesList.innerHTML = '';
        if (data.breaches && data.breaches.length > 0) {
            data.breaches.forEach(breach => {
                const div = document.createElement('div');
                div.className = 'threat-item';
                
                const classes = breach.DataClasses ? breach.DataClasses.map(c => `<span class="threat-badge">${c}</span>`).join('') : '';
                div.innerHTML = `
                    <h4>${breach.Name}</h4>
                    <p><strong>Date:</strong> ${breach.BreachDate} | <strong>Domain:</strong> ${breach.Domain}</p>
                    <p>${breach.Description}</p>
                    <div class="badges-container">${classes}</div>
                `;
                breachesList.appendChild(div);
            });
        } else {
            breachesList.innerHTML = '<p style="color: var(--text-muted)">No data breaches detected for this identifier.</p>';
        }

        // 3. Render Recommendations
        recommendationsList.innerHTML = '';
        if (assessment.recommendations && assessment.recommendations.length > 0) {
            assessment.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                recommendationsList.appendChild(li);
            });
        }

        // 4. Render Public Accounts
        accountsList.innerHTML = '';
        if (data.gravatar) {
            accountsList.innerHTML += `
                <div class="account-badge">
                    <img src="${data.gravatar}" alt="Gravatar">
                    <div class="account-info">
                        <h4>Gravatar</h4>
                        <p>Public Profile Image Found</p>
                    </div>
                </div>
            `;
        }
        if (data.github) {
            accountsList.innerHTML += `
                <div class="account-badge">
                    <img src="${data.github.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" alt="GitHub">
                    <div class="account-info">
                        <h4>GitHub: ${data.username}</h4>
                        <p>${data.github.public_repos} Public Repos</p>
                        <a href="${data.github.html_url}" target="_blank">View Profile</a>
                    </div>
                </div>
            `;
        }
        if (!data.gravatar && !data.github) {
            accountsList.innerHTML = '<p style="color: var(--text-muted)">No public profiles linked directly to these identifiers.</p>';
        }

        // 5. Initialize Cytoscape Graph
        initGraph(data);
    }

    function maskLabel(label) {
        if (!label) return '';
        if (label.includes('@')) {
            const parts = label.split('@');
            const name = parts[0];
            const domain = parts[1];
            return name.length > 3 
                ? name.substring(0, 3) + '****@' + domain 
                : name + '****@' + domain;
        }
        return label.length > 15 ? label.substring(0, 12) + '...' : label;
    }

    function initGraph(data) {
        const elements = [];
        const mainNodeId = "target";
        
        // Root Node
        elements.push({
            data: { id: mainNodeId, label: "Target", fullLabel: "Target Entity" },
            classes: 'root-node'
        });

        if (data.email) {
            elements.push({ data: { id: "email", label: maskLabel(data.email), fullLabel: data.email }, classes: 'identifier' });
            elements.push({ data: { source: mainNodeId, target: "email", label: "has_email" }});
            
            if (data.gravatar) {
                elements.push({ data: { id: "gravatar", label: "Gravatar", fullLabel: "Gravatar Config" }, classes: 'profile' });
                elements.push({ data: { source: "email", target: "gravatar" }});
            }

            if (data.breaches && data.breaches.length > 0) {
                data.breaches.forEach((b, i) => {
                    const bId = `breach_${i}`;
                    elements.push({ data: { id: bId, label: maskLabel(b.Name), fullLabel: b.Name }, classes: 'breach' });
                    elements.push({ data: { source: "email", target: bId }});
                });
            }
        }

        if (data.username && data.github) {
            elements.push({ data: { id: "username", label: maskLabel(data.username), fullLabel: data.username }, classes: 'identifier' });
            elements.push({ data: { source: mainNodeId, target: "username", label: "has_username" }});
            
            elements.push({ data: { id: "github", label: "GitHub", fullLabel: "GitHub Profile" }, classes: 'account' });
            elements.push({ data: { source: "username", target: "github" }});
        }

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: elements,
            zoomingEnabled: true,
            userZoomingEnabled: false,
            panningEnabled: true,
            userPanningEnabled: true,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#0d111a',
                        'border-width': 2,
                        'border-color': '#e0e0e0',
                        'label': 'data(label)',
                        'color': '#fff',
                        'font-size': '12px',
                        'font-family': 'monospace',
                        'text-valign': 'bottom',
                        'text-halign': 'center',
                        'text-margin-y': '8px'
                    }
                },
                {
                    selector: '.root-node',
                    style: {
                        'border-width': 3,
                        'border-color': '#e0e0e0',
                        'width': '40px',
                        'height': '40px',
                        'background-color': '#111'
                    }
                },
                {
                    selector: '.identifier',
                    style: {
                        'border-color': '#00ff41',
                        'background-color': 'rgba(0, 255, 65, 0.2)',
                        'shape': 'hexagon'
                    }
                },
                {
                    selector: '.breach',
                    style: {
                        'border-color': '#ff003c',
                        'background-color': 'rgba(255, 0, 60, 0.2)',
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: '.account',
                    style: {
                        'border-color': '#0055ff',
                        'background-color': 'rgba(0, 85, 255, 0.2)',
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: '.profile',
                    style: {
                        'border-color': '#ffb000',
                        'background-color': 'rgba(255, 176, 0, 0.2)',
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#1e2d3d',
                        'target-arrow-color': '#1e2d3d',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
            layout: {
                name: 'cose',
                padding: 100,
                animate: false,
                randomize: true,
                componentSpacing: 100,
                nodeRepulsion: function( node ){ return 400000; },
                nodeOverlap: 40,
                idealEdgeLength: function( edge ){ return 150; },
                edgeElasticity: function( edge ){ return 100; },
                nestingFactor: 5,
                gravity: 80,
                numIter: 1000,
                initialTemp: 200,
                coolingFactor: 0.95,
                minTemp: 1.0
            }
        });
        
        cy.ready(function() {
            cy.fit();
            cy.center();
        });
        
        // Setup tooltip
        let tooltip = document.getElementById('cy-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'cy-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.display = 'none';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            tooltip.style.color = '#00ff41';
            tooltip.style.padding = '8px 12px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.border = '1px solid #00ff41';
            tooltip.style.fontSize = '12px';
            tooltip.style.fontFamily = 'monospace';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.style.boxShadow = '0 0 10px rgba(0, 255, 65, 0.2)';
            document.body.appendChild(tooltip);
        }

        cy.on('mouseover', 'node', function(e) {
            const node = e.target;
            const fullLabel = node.data('fullLabel');
            if (fullLabel) {
                tooltip.innerHTML = fullLabel;
                tooltip.style.display = 'block';
            }
        });

        cy.on('mousemove', function(e) {
            tooltip.style.left = (e.originalEvent.pageX + 15) + 'px';
            tooltip.style.top = (e.originalEvent.pageY + 15) + 'px';
        });

        cy.on('mouseout', 'node', function(e) {
            tooltip.style.display = 'none';
        });

        // We removed disable zooming/panning to allow interactive graph exploration
    }
});
