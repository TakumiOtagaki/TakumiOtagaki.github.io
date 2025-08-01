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
    function createCard(title, value, category = 'default') {
        const card = document.createElement('div');
        card.style.border = '1px solid #e1e4e8';
        card.style.borderRadius = '8px';
        card.style.padding = '16px';
        card.style.margin = '8px';
        card.style.flex = '1 1 calc(33% - 16px)';
        card.style.boxSizing = 'border-box';
        card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        // カテゴリ別の色分け
        switch (category) {
            case 'account':
                card.style.background = 'linear-gradient(135deg, #f6f8fa 0%, #e1e4e8 100%)';
                card.style.borderColor = '#d0d7de';
                break;
            case 'repository':
                card.style.background = 'linear-gradient(135deg, #fff8e3 0%, #f6f1e0 100%)';
                card.style.borderColor = '#e6d5b8';
                break;
            case 'social':
                card.style.background = 'linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%)';
                card.style.borderColor = '#91caff';
                break;
            case 'code':
                card.style.background = 'linear-gradient(135deg, #f0f9e8 0%, #e6f4dc 100%)';
                card.style.borderColor = '#b7eb8f';
                break;
            default:
                card.style.background = '#fafbfc';
        }

        // ホバー効果
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        });

        const h3 = document.createElement('h3');
        h3.textContent = title;
        h3.style.margin = '0 0 8px';
        h3.style.fontSize = '1.1em';
        h3.style.color = '#333';

        const p = document.createElement('p');
        p.textContent = value;
        p.style.margin = '0';
        p.style.fontSize = '1.5em';
        p.style.fontWeight = 'bold';
        p.style.color = '#0366d6';

        card.appendChild(h3);
        card.appendChild(p);
        return card;
    }

    // Layout
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">📊 GitHub統計を読み込み中...</p>';
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

        // Aggregate stars, forks, languages, and additional stats
        let totalStars = 0;
        let totalForks = 0;
        let totalWatchers = 0;
        let totalIssues = 0;
        let totalSize = 0; // in KB
        let publicRepos = 0;
        let forkedRepos = 0;
        let originalRepos = 0;
        const langCount = {};
        const recentRepos = [];

        repos.forEach(repo => {
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            totalWatchers += repo.watchers_count;
            totalIssues += repo.open_issues_count;
            totalSize += repo.size;

            if (repo.fork) {
                forkedRepos++;
            } else {
                originalRepos++;
            }

            if (!repo.private) {
                publicRepos++;
            }

            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }

            // 最近更新されたリポジトリ（上位5つ）
            if (recentRepos.length < 5) {
                recentRepos.push({
                    name: repo.name,
                    updated: new Date(repo.updated_at),
                    stars: repo.stargazers_count,
                    language: repo.language
                });
            }
        });

        // 最近更新されたリポジトリを日付順にソート
        recentRepos.sort((a, b) => b.updated - a.updated);

        // Build cards
        container.innerHTML = ''; // Clear loading message

        // Account info
        const accountAge = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 365.25));
        container.appendChild(createCard('Account Age', `${accountAge} years`, 'account'));

        // Repository stats
        container.appendChild(createCard('Public Repos', publicRepos, 'repository'));
        container.appendChild(createCard('Original Repos', originalRepos, 'repository'));
        container.appendChild(createCard('Forked Repos', forkedRepos, 'repository'));

        // Social stats
        container.appendChild(createCard('Followers', user.followers, 'social'));
        container.appendChild(createCard('Following', user.following, 'social'));

        // Code stats
        container.appendChild(createCard('Total Stars', totalStars, 'code'));
        container.appendChild(createCard('Total Forks', totalForks, 'code'));
        container.appendChild(createCard('Open Issues', totalIssues, 'code'));
        container.appendChild(createCard('Total Size', `${(totalSize / 1024).toFixed(1)} MB`, 'code'));        // Language distribution list
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

        // Recent repositories card
        if (recentRepos.length > 0) {
            const recentCard = document.createElement('div');
            recentCard.style.border = '1px solid #e1e4e8';
            recentCard.style.borderRadius = '8px';
            recentCard.style.padding = '16px';
            recentCard.style.margin = '8px';
            recentCard.style.flex = '1 1 100%';
            recentCard.style.boxSizing = 'border-box';
            recentCard.style.background = '#fafbfc';

            const hr = document.createElement('h3');
            hr.textContent = 'Recently Updated';
            hr.style.margin = '0 0 8px';
            hr.style.fontSize = '1.1em';
            recentCard.appendChild(hr);

            const recentList = document.createElement('div');
            recentList.style.display = 'grid';
            recentList.style.gap = '8px';

            recentRepos.slice(0, 3).forEach(repo => {
                const repoDiv = document.createElement('div');
                repoDiv.style.padding = '8px';
                repoDiv.style.background = '#ffffff';
                repoDiv.style.border = '1px solid #e1e4e8';
                repoDiv.style.borderRadius = '4px';
                repoDiv.style.fontSize = '14px';

                const repoName = document.createElement('strong');
                repoName.textContent = repo.name;
                repoName.style.color = '#0366d6';

                const repoInfo = document.createElement('div');
                repoInfo.style.color = '#666';
                repoInfo.style.fontSize = '12px';
                repoInfo.style.marginTop = '4px';

                const parts = [];
                if (repo.language) parts.push(`${repo.language}`);
                if (repo.stars > 0) parts.push(`⭐ ${repo.stars}`);
                parts.push(`Updated: ${repo.updated.toLocaleDateString('ja-JP')}`);

                repoInfo.textContent = parts.join(' • ');

                repoDiv.appendChild(repoName);
                repoDiv.appendChild(repoInfo);
                recentList.appendChild(repoDiv);
            });

            recentCard.appendChild(recentList);
            container.appendChild(recentCard);
        }

    } catch (err) {
        console.error('GitHub Stats Error:', err);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px;">
                <h4 style="color: #d73a49; margin: 0 0 10px 0;">GitHub統計の読み込みに失敗しました</h4>
                <p style="color: #666; margin: 0; font-size: 14px;">
                    GitHub APIの制限またはネットワークエラーが発生しました。<br>
                    しばらく時間をおいてから再度お試しください。
                </p>
                <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">
                    エラー詳細: ${err.message}
                </p>
            </div>
        `;
        container.setAttribute('data-error', 'true');
    }
})();
