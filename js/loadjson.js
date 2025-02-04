const obtenerDatosMaestros = async (url) => {
    var data = await $.ajax({
        url: url,
        dataType: 'json',
        success: function (data) {
        },
        error: function(xhr, status, error) {
            console.error("Error al leer el archivo JSON: ", status, error);
        }
    });

    return data;
}

const guardarDatos = async (url, data) => {

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: data
        });
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

}

const obtenerDatos = async (url) => {

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        const result = await response.text();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

}