tolk 1.0

import "@stdlib/tvm-dicts";


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

type AllowedMessage = Mint

struct Mint {
  queryId: uint64
  amount: uint64
}

fun onInternalMessage(in: InMessage) {
  val msg = lazy AllowedMessage.fromSlice(in.body);

  var s = lazy Storage.load();

  match (msg) {
    Mint => {
      s.totalSupply += msg.amount;
    }
    else => {
      // другие сообщения игнорируем
    }
  }

  s.save();
}