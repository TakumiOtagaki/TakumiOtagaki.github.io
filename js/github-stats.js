// github-stats.js
// Usage: include this script in your HTML and add a container with id="github-stats"
// Example: <div id="github-stats"></div>
// <script src="github-stats.js"></script>

(async () => {
    const username = 'TakumiOtagaki'; // Replace with your GitHub username
    const container = document.getElementById('github-stats');
    if (!container) {
        console.error('Container #github-stats not found');
        return;
    }

    // Helper to create card elements
    function createCard(title, value) {
        const card = document.createElement('div');
        card.style.border = '1px solid #e1e4e8';
        card.style.borderRadius = '8px';
        card.style.padding = '16px';
        card.style.margin = '8px';
        card.style.flex = '1 1 calc(33% - 16px)';
        card.style.boxSizing = 'border-box';
        card.style.background = '#fafbfc';

        const h3 = document.createElement('h3');
        h3.textContent = title;
        h3.style.margin = '0 0 8px';
        h3.style.fontSize = '1.1em';

        const p = document.createElement('p');
        p.textContent = value;
        p.style.margin = '0';
        p.style.fontSize = '1.5em';
        p.style.fontWeight = 'bold';

        card.appendChild(h3);
        card.appendChild(p);
        return card;
    }

    // Layout
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'space-between';

    try {
        // Fetch user info
        const userResp = await fetch(`https://api.github.com/users/${username}`);
        if (!userResp.ok) throw new Error('Failed to fetch user info');
        const user = await userResp.json();

        // Fetch repos (paginated)
        let repos = [];
        let page = 1;
        while (true) {
            const resp = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`);
            if (!resp.ok) break;
            const data = await resp.json();
            if (data.length === 0) break;
            repos = repos.concat(data);
            page++;
        }

        // Aggregate stars, forks, languages
        let totalStars = 0;
        let totalForks = 0;
        const langCount = {};
        repos.forEach(repo => {
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        });

        // Build cards
        container.appendChild(createCard('Repositories', repos.length));
        container.appendChild(createCard('Stars', totalStars));
        container.appendChild(createCard('Forks', totalForks));
        container.appendChild(createCard('Followers', user.followers));
        container.appendChild(createCard('Following', user.following));

        // Language distribution list
        const langCard = document.createElement('div');
        langCard.style.border = '1px solid #e1e4e8';
        langCard.style.borderRadius = '8px';
        langCard.style.padding = '16px';
        langCard.style.margin = '8px';
        langCard.style.flex = '1 1 100%';
        langCard.style.boxSizing = 'border-box';
        langCard.style.background = '#fafbfc';

        const hl = document.createElement('h3');
        hl.textContent = 'Languages';
        hl.style.margin = '0 0 8px';
        hl.style.fontSize = '1.1em';
        langCard.appendChild(hl);

        const ul = document.createElement('ul');
        ul.style.margin = '0';
        ul.style.padding = '0 0 0 16px';
        Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])
            .forEach(([lang, count]) => {
                const li = document.createElement('li');
                li.textContent = `${lang}: ${count} repo(s)`;
                ul.appendChild(li);
            });
        langCard.appendChild(ul);
        container.appendChild(langCard);

    } catch (err) {
        console.error(err);
        container.textContent = 'Error loading GitHub stats.';
    }
})();
