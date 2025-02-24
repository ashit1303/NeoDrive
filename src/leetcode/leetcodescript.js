const axios = require("axios");

async function fetchLeetCodeProblem(slug) {
    const url = "https://leetcode.com/graphql";
    const query = {
        query: ` query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                titleSlug
                questionId
                questionFrontendId
                questionTitle
                content
                categoryTitle
                difficulty

                similarQuestionList {
                  difficulty
                  titleSlug
                  questionId
                  title
                }
                nextChallenges {
                  difficulty
                  questionId
                  title
                  titleSlug
                }
            }
        }`,
        variables: { titleSlug: slug },
        // operationName: 'questionDetail'
    };

    try {
        const response = await axios.post(url, query, {
            headers: {
              'accept': '*/*',
              'accept-language': 'en-US,en;q=0.9',
              'content-type': 'application/json',
              'cookie': 'csrftoken=Yuj3H94eV7MNl7hAI1OeXAisL1CSkyvmuNauiTyJwJXQNGcvistoup1NwaNZxGZv; INGRESSCOOKIE=6fa80ea5fa6cf8f12cf813fe43cf5b85|8e0876c7c1464cc0ac96bc2edceabd27; gr_user_id=3cab1562-f3df-434b-bae9-69cee92eb884; 87b5a3c3f1a55520_gr_session_id=33b8bd65-c80c-4e14-b707-748bea001f9a; _gid=GA1.2.25366885.1740385264; _gat=1; ip_check=(false, "2409:40d0:10c8:c35:eaf3:cbc4:200:9ff7"); 87b5a3c3f1a55520_gr_session_id_sent_vst=33b8bd65-c80c-4e14-b707-748bea001f9a; _ga=GA1.1.1730980087.1740385264; _ga_CDRWKZTDEX=GS1.1.1740385263.1.1.1740385293.30.0.0',
              'origin': 'https://leetcode.com',
              'priority': 'u=1, i',
              'random-uuid': '00b3b94a-d622-baec-d6fa-77dbd29d94d3',
              'referer': 'https://leetcode.com/problems/${slug}/description/',
              'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Linux"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'sentry-trace': 'aadd23de586549d0b62e02c85c318cd5-b5d86e9245155ec0-0',
              'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
              'x-csrftoken': 'Yuj3H94eV7MNl7hAI1OeXAisL1CSkyvmuNauiTyJwJXQNGcvistoup1NwaNZxGZv'
            }
        });

        const problem = response.data.data.question;
        console.log(response.data.data.question)
        // console.log(`\n✅ Problem Title: ${problem.title}`);
        // console.log(`\n📜 Problem Statement:\n${problem.content.replace(/<\/?[^>]+(>|$)/g, "")/* .substring(0, 500) */}...`);
    } catch (error) {
        // console.error("❌ Error fetching problem:", error.message);
    }
}

// Run the function with the problem slug (e.g., "two-sum")
fetchLeetCodeProblem("two-sum");
