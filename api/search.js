export default async function handler(req, res) {
    const { p_num, p_name, h_num, h_name } = req.query;

    let result = {
        byNum: { player: { name: "未登録", id: "-" }, horse: { name: "未登録", id: "-" } },
        byName: { player: { name: "未登録", id: "-" }, horse: { name: "未登録", id: "-" } }
    };

    const fetchFromDB = async (type, query) => {
        if (!query || query === "" || query === "-") return null;
        const url = type === 'player' 
            ? `https://www.equitation-japan.com/search.php?search=site_search_member&q=${encodeURIComponent(query)}`
            : `https://www.equitation-japan.com/search.php?search=horse2&auth=AUTH_SITE&q=${encodeURIComponent(query)}`;
        
        try {
            const response = await fetch(url);
            const text = await response.text();
            const lines = text.trim().split('\n');
            if (!lines[0] || lines[0].trim() === "") return null;

            let data = lines[0].split('|');
            if (!isNaN(query)) {
                for (let line of lines) {
                    let d = line.split('|');
                    if (type === 'player' && d[0] === query) data = d;
                    if (type === 'horse' && d[2] === query) data = d;
                }
            }
            return type === 'player' ? { name: data[2], id: data[0] } : { name: data[0], id: data[2] };
        } catch (e) { return null; }
    };

    const [pByNum, hByNum, pByName, hByName] = await Promise.all([
        fetchFromDB('player', p_num),
        fetchFromDB('horse', h_num),
        fetchFromDB('player', p_name),
        fetchFromDB('horse', h_name)
    ]);

    if (pByNum) result.byNum.player = pByNum;
    if (hByNum) result.byNum.horse = hByNum;
    if (pByName) result.byName.player = pByName;
    if (hByName) result.byName.horse = hByName;

    res.status(200).json(result);
}