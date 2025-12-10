import axios from "axios";

export async function googleSearch(query: string) {
    const data = JSON.stringify({
        q: query,
        gl: "in",
        location: "Jaipur, Rajasthan, India",
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://google.serper.dev/search',
        headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        return response.data;
    }
    catch (error) {
        return { error };
    }
}
