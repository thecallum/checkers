module.exports = () => {
    let list = {}; // format [`${id_1}${id_2}`]

    const create = (id_1, id_2) => {
        const id = `${id_1}${id_2}`;

        if (list.hasOwnProperty(id)) {
            return false;
        } else {
            list = {
                ...list,
                [id]: { [id_1]: false, [id_2]: false },
            };
        }
    };

    const close = id => {
        let foundID = findKey(id);
        delete list[foundID];
    };

    const getOpponentID = id => {
        let opponentID;
        for (let key of Object.keys(list)) {
            if (key.includes(id)) {
                opponentID = key.split(id).join('');
                break;
            }
        }

        return opponentID;
    };

    const findKey = id => {
        let foundID;

        for (let key of Object.keys(list)) {
            if (key.includes(id)) {
                foundID = key;
                break;
            }
        }

        return foundID;
    };

    const accept = id => {
        const foundID = findKey(id);

        // already accepted
        if (list[foundID][id]) return true;

        list = {
            ...list,
            [foundID]: {
                ...list[foundID],
                [id]: true,
            },
        };

        return false;
    };

    const bothAccepted = id => {
        const foundID = findKey(id);
        const opponentID = getOpponentID(id);

        return list[foundID][id] && list[foundID][opponentID];
    };

    return { create, close, getOpponentID, accept, bothAccepted, findKey };
};
