tolk 1.0

import "@stdlib/tvm-dicts";

const ADMIN = address("0QDJHy0pTrhEuKPfgPIeRI2biWLvIlcl9HvjB-NKiyPGcOiV")

struct Storage {
    totalSupply: uint64
}

fun Storage.load(): Storage {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}

get fun getTotalSupply(): uint64 {
    var s = lazy  Storage.load();
    return s.totalSupply;
}

type AllowedMessage = Mint | Upgrade

struct (0x00000001) Mint {
    queryId: uint64
    amount: uint64
}

struct (0x00007fff) Upgrade {
    queryId: uint64
    newCode: cell 
}

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);

    var s = lazy Storage.load();

    match (msg) {
        Mint => {
            s.totalSupply += msg.amount;
        }
        Upgrade => {
            if(in.senderAddress != ADMIN) {
                throw 401;
            }

            contract.setCodePostponed(msg.newCode);

            return; 
        }
        else => {
        // другие сообщения игнорируем
        }
    }

    s.save();
}