interface wpQuery{
    query: string;
    variable?: object;
}


export const wordPressFecth = async( { query, variable} : wpQuery)=> {

    const response = await fetch(`http://astro-curso-product.local/graphql`, {
        method: "post",
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ query, variable }),
    })

    if(!response.ok){
        console.log(response);
        return {};
        
    }

    const {data} = await response.json();
    return data;
}



