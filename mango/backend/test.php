<?php $req = Illuminate\Http\Request::create("/api/v1/machines/reservations/1/pdf", "GET"); $req->headers->set("Accept", "application/json"); $res = app()->handle($req); echo $res->getStatusCode();
