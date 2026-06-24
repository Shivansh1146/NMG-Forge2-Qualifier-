<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $guarded = [];

    public function boardList()
    {
        return $this->belongsTo(BoardList::class, 'list_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function activities()
    {
        return $this->hasMany(CardActivity::class)->orderBy('timestamp', 'desc');
    }
}
