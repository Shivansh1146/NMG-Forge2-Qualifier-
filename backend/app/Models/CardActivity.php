<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardActivity extends Model
{
    protected $guarded = [];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
