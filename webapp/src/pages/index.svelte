<script>
  import {wallet} from "../stores/wallet";
</script>


{JSON.stringify($wallet, null, '  ')}

<br/>
<button on:click="{() => wallet.probeBuiltin()}">probeBuiltin</button><br/>
<button on:click="{() => wallet.connect('builtin')}">builtin</button><br/>
<button on:click="{() => wallet.connect('portis')}">portis</button><br/>
<button on:click="{() => wallet.unlock()}">unlock</button><br/>

