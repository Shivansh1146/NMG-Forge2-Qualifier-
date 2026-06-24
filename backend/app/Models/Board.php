<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $guarded = [];

    public function lists()
    {
        return $this->hasMany(BoardList::class, 'board_id')->orderBy('position');
    }

    public function cards()
    {
        return $this->hasMany(Card::class);
    }
}
